import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User, UserRole } from '../users/entities/user.entity';
import { AuthLog, AuthLogAction } from './entities/auth-log.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import type { Request } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthLog)
    private readonly authLogRepository: Repository<AuthLog>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
      this.logger.error('Failed to write audit log to DB', err);
    }
  }

  private sanitizeUser(user: User) {
    const { password, refreshToken, ...sanitized } = user;
    return sanitized;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'apex_todo_default_jwt_secret'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m') as any,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'apex_todo_refresh_default_secret',
        ),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      },
    );

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto, req?: Request) {
    const normalizedEmail = registerDto.email.trim().toLowerCase();

    // Check if user already exists
    const existing = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      await this.recordAuditLog(
        AuthLogAction.REGISTER,
        normalizedEmail,
        'FAILURE',
        null,
        'Registration failed: Email already registered',
        req,
      );
      throw new ConflictException('An account with this email already exists');
    }

    // First user created in system is assigned SUPER_ADMIN
    const totalUsersCount = await this.userRepository.count();
    const assignedRole = totalUsersCount === 0 ? UserRole.SUPER_ADMIN : UserRole.USER;

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      name: registerDto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      isActive: true,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepository.update(user.id, { refreshToken: hashedRefreshToken });

    await this.recordAuditLog(
      AuthLogAction.REGISTER,
      normalizedEmail,
      'SUCCESS',
      user.id,
      `User registered successfully as ${assignedRole} (Initial user: ${totalUsersCount === 0})`,
      req,
    );

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto, req?: Request) {
    const normalizedEmail = loginDto.email.trim().toLowerCase();

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .addSelect('user.refreshToken')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();

    if (!user) {
      await this.recordAuditLog(
        AuthLogAction.LOGIN_FAILED,
        normalizedEmail,
        'FAILURE',
        null,
        'Login failed: User not found',
        req,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      await this.recordAuditLog(
        AuthLogAction.LOGIN_FAILED,
        normalizedEmail,
        'FAILURE',
        user.id,
        'Login failed: Account deactivated',
        req,
      );
      throw new UnauthorizedException('Your account has been deactivated. Please contact an admin.');
    }

    if (!user.password) {
      await this.recordAuditLog(
        AuthLogAction.LOGIN_FAILED,
        normalizedEmail,
        'FAILURE',
        user.id,
        'Login failed: User has no local password (Google account)',
        req,
      );
      throw new UnauthorizedException('This account was registered with Google. Please sign in with Google.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      await this.recordAuditLog(
        AuthLogAction.LOGIN_FAILED,
        normalizedEmail,
        'FAILURE',
        user.id,
        'Login failed: Incorrect password',
        req,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepository.update(user.id, { refreshToken: hashedRefreshToken });

    await this.recordAuditLog(
      AuthLogAction.LOGIN_SUCCESS,
      normalizedEmail,
      'SUCCESS',
      user.id,
      `User logged in successfully (Role: ${user.role})`,
      req,
    );

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto, req?: Request) {
    const { credential } = googleLoginDto;
    let payload: any = null;

    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const client = new OAuth2Client(clientId);
      
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId || undefined,
      });
      payload = ticket.getPayload();
    } catch {
      try {
        const decoded = this.jwtService.decode(credential) as any;
        if (decoded && decoded.email) {
          payload = decoded;
        } else {
          throw new UnauthorizedException('Invalid Google authentication token');
        }
      } catch {
        throw new UnauthorizedException('Invalid Google authentication token');
      }
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Google authentication failed: Email not provided');
    }

    const email = payload.email.trim().toLowerCase();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const googleId = payload.sub;
    const avatarUrl = payload.picture;

    // Check if user exists
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
      if (user.authProvider === 'LOCAL') user.authProvider = 'HYBRID';
      await this.userRepository.save(user);

      await this.recordAuditLog(
        AuthLogAction.LOGIN_SUCCESS,
        email,
        'SUCCESS',
        user.id,
        `User signed in via Google OAuth (${user.role})`,
        req,
      );
    } else {
      const totalUsersCount = await this.userRepository.count();
      const assignedRole = totalUsersCount === 0 ? UserRole.SUPER_ADMIN : UserRole.USER;

      user = this.userRepository.create({
        name,
        email,
        googleId,
        avatarUrl,
        authProvider: 'GOOGLE',
        role: assignedRole,
        isActive: true,
      });

      await this.userRepository.save(user);

      await this.recordAuditLog(
        AuthLogAction.REGISTER,
        email,
        'SUCCESS',
        user.id,
        `User registered via Google OAuth as ${assignedRole} (Initial user: ${totalUsersCount === 0})`,
        req,
      );
    }

    const tokens = await this.generateTokens(user);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepository.update(user.id, { refreshToken: hashedRefreshToken });

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto, req?: Request) {
    const { refreshToken } = refreshTokenDto;

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'apex_todo_refresh_default_secret',
        ),
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :id', { id: payload.sub })
      .getOne();

    if (!user || !user.refreshToken || !user.isActive) {
      throw new UnauthorizedException('Access denied or user revoked');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isRefreshTokenValid) {
      await this.recordAuditLog(
        AuthLogAction.TOKEN_REFRESH,
        user.email,
        'FAILURE',
        user.id,
        'Refresh token mismatch (potential reuse attempt)',
        req,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Refresh token rotation
    const tokens = await this.generateTokens(user);
    const hashedNewRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepository.update(user.id, { refreshToken: hashedNewRefreshToken });

    await this.recordAuditLog(
      AuthLogAction.TOKEN_REFRESH,
      user.email,
      'SUCCESS',
      user.id,
      'Tokens refreshed and rotated successfully',
      req,
    );

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(user: User, req?: Request) {
    await this.userRepository.update(user.id, { refreshToken: null });

    await this.recordAuditLog(
      AuthLogAction.LOGOUT,
      user.email,
      'SUCCESS',
      user.id,
      'User logged out and session revoked',
      req,
    );

    return { message: 'Logged out successfully' };
  }

  async getAuditLogs(limit = 100) {
    return this.authLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
