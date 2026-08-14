import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AuthLog, AuthLogAction } from '../auth/entities/auth-log.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import type { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthLog)
    private readonly authLogRepository: Repository<AuthLog>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private extractClientMeta(req?: Request) {
    const ipAddress =
      (req?.headers['x-forwarded-for'] as string) ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      '127.0.0.1';
    const userAgent = (req?.headers['user-agent'] as string) || 'Unknown';
    return { ipAddress, userAgent };
  }

  private async recordAuditLog(
    action: AuthLogAction | string,
    userEmail: string,
    status: 'SUCCESS' | 'FAILURE',
    userId?: string | null,
    details?: string,
    req?: Request,
  ) {
    try {
      const { ipAddress, userAgent } = this.extractClientMeta(req);
      const log = this.authLogRepository.create({
        userId: userId || null,
        userEmail,
        action,
        status,
        ipAddress,
        userAgent,
        details,
      });
      await this.authLogRepository.save(log);
    } catch (err) {
      console.error('Failed to log audit event', err);
    }
  }

  async findAll(): Promise<any[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.tasks', 'task')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.isActive',
        'user.createdAt',
        'user.updatedAt',
      ])
      .addSelect('COUNT(task.id)', 'taskCount')
      .groupBy('user.id')
      .orderBy('user.createdAt', 'ASC')
      .getRawAndEntities();

    return users.entities.map((user, index) => ({
      ...user,
      taskCount: parseInt(users.raw[index]?.taskCount || '0', 10),
    }));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async getAssignableUsers(currentUser: User): Promise<User[]> {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return this.userRepository.find({
        where: { isActive: true },
        select: { id: true, name: true, email: true, role: true },
        order: { name: 'ASC' },
      });
    }

    if (currentUser.role === UserRole.ADMIN) {
      return this.userRepository.find({
        where: [
          { role: UserRole.USER, isActive: true },
          { id: currentUser.id, isActive: true },
        ],
        select: { id: true, name: true, email: true, role: true },
        order: { name: 'ASC' },
      });
    }

    return [currentUser];
  }

  async createUser(
    createUserDto: CreateUserDto,
    creator: User,
    req?: Request,
  ): Promise<User> {
    const normalizedEmail = createUserDto.email.trim().toLowerCase();

    const existing = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Role assignment rules:
    // Only SUPER_ADMIN can create SUPER_ADMIN or other ADMINs.
    // Regular ADMIN can ONLY create USER (Member).
    let targetRole = createUserDto.role || UserRole.USER;

    if (creator.role === UserRole.ADMIN) {
      if (targetRole !== UserRole.USER) {
        throw new ForbiddenException('Admin users can only provision standard Member accounts');
      }
    } else if (creator.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You do not have permission to provision users');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.userRepository.create({
      name: createUserDto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: targetRole,
      isActive: true,
    });

    const saved = await this.userRepository.save(newUser);

    // If created by an Admin, notify Super Admin
    if (creator.role === UserRole.ADMIN) {
      await this.notificationsService.createNotification(
        'Member Created by Admin',
        `Admin ${creator.name} (${creator.email}) provisioned new member ${saved.name} (${saved.email})`,
        creator.email,
        saved.email,
        NotificationType.MEMBER_CREATED,
      );
    }

    await this.recordAuditLog(
      AuthLogAction.USER_CREATED_BY_ADMIN,
      normalizedEmail,
      'SUCCESS',
      saved.id,
      `User created by ${creator.role} (${creator.email}) with role ${targetRole}`,
      req,
    );

    const { password, refreshToken, ...sanitized } = saved;
    return sanitized as User;
  }

  async updateUserRole(
    userId: string,
    updateRoleDto: UpdateUserRoleDto,
    creator: User,
    req?: Request,
  ): Promise<User> {
    if (creator.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins have permission to modify user roles');
    }

    if (creator.id === userId && updateRoleDto.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('You cannot change your own Super Admin role');
    }

    const user = await this.findOne(userId);
    const oldRole = user.role;
    user.role = updateRoleDto.role;

    const updated = await this.userRepository.save(user);

    await this.recordAuditLog(
      AuthLogAction.USER_ROLE_CHANGED,
      user.email,
      'SUCCESS',
      user.id,
      `Role changed from ${oldRole} to ${updateRoleDto.role} by Super Admin (${creator.email})`,
      req,
    );

    return updated;
  }

  async deleteUser(userId: string, creator: User, req?: Request): Promise<void> {
    if (creator.id === userId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.findOne(userId);

    // If Admin is deleting, they can only delete standard Members
    if (creator.role === UserRole.ADMIN) {
      if (user.role !== UserRole.USER) {
        throw new ForbiddenException('Admins can only delete standard Member accounts');
      }

      // Notify Super Admin
      await this.notificationsService.createNotification(
        'Member Deleted by Admin',
        `Admin ${creator.name} (${creator.email}) deleted member account ${user.name} (${user.email})`,
        creator.email,
        user.email,
        NotificationType.MEMBER_DELETED,
      );
    } else if (creator.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Insufficient permissions to delete users');
    }

    await this.userRepository.delete(userId);

    await this.recordAuditLog(
      AuthLogAction.USER_DELETED,
      user.email,
      'SUCCESS',
      null,
      `User account ${user.email} deleted by ${creator.role} (${creator.email})`,
      req,
    );
  }
}
