import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { AuthLog } from '../auth/entities/auth-log.entity';

export interface TaskQueryFilter {
  completed?: string;
  priority?: string;
  category?: string;
  search?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
  mode?: 'admin' | 'personal';
  scope?: 'all' | 'assigned' | 'created';
}

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthLog)
    private readonly authLogRepository: Repository<AuthLog>,
  ) {}

  async onModuleInit() {
    const count = await this.taskRepository.count();
    if (count === 0) {
      console.log('[TasksService] Database is empty. Seeding initial demo tasks...');
      await this.seedInitialTasks();
    }
  }

  async seedInitialTasks(): Promise<Task[]> {
    const sampleTasks = [
      {
        title: 'Setup PostgreSQL & TypeORM Database',
        description:
          'Configure todo_db schema synchronization, connection pool, and TypeORM entity models.',
        completed: true,
        priority: TaskPriority.URGENT,
        category: 'Database',
      },
      {
        title: 'Build Angular 19 Standalone Signals UI',
        description:
          'Implement reactive state management using Signal store, Glassmorphic theme tokens, and custom CSS.',
        completed: true,
        priority: TaskPriority.HIGH,
        category: 'Frontend',
      },
      {
        title: 'Deploy NestJS REST API Controller & DTOs',
        description:
          'Create CRUD endpoints, request payload validation pipes, and CORS integration middleware.',
        completed: false,
        priority: TaskPriority.HIGH,
        category: 'Backend',
      },
      {
        title: 'Implement Interactive Kanban Board View',
        description:
          'Enable dual-view layout switching between standard list view and column-based Kanban workspace.',
        completed: false,
        priority: TaskPriority.MEDIUM,
        category: 'Frontend',
      },
      {
        title: 'Write Technical Architecture README',
        description:
          'Draft senior engineering setup documentation, API specifications, and environment variable references.',
        completed: true,
        priority: TaskPriority.MEDIUM,
        category: 'Docs',
      },
    ];

    const tasks = this.taskRepository.create(sampleTasks);
    return this.taskRepository.save(tasks);
  }

  async findAll(filter: TaskQueryFilter, user: User) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 20;
    const skip = (page - 1) * limit;

    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'creator')
      .leftJoinAndSelect('task.assignedTo', 'assignee');

    const isAdmin =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;
    const isPersonalMode = filter.mode === 'personal' || !isAdmin;

    if (isPersonalMode) {
      if (filter.scope === 'assigned') {
        query.andWhere('task.assignedToId = :userId', { userId: user.id });
      } else if (filter.scope === 'created') {
        query.andWhere('task.userId = :userId', { userId: user.id });
      } else {
        query.andWhere(
          '(task.userId = :userId OR task.assignedToId = :userId OR (task.userId IS NULL AND task.assignedToId IS NULL))',
          { userId: user.id },
        );
      }
    } else {
      // Admin Executive Overview: Can optionally filter by specific assignee
      if (filter.assignedToId) {
        query.andWhere('task.assignedToId = :assignedToId', {
          assignedToId: filter.assignedToId,
        });
      }
    }

    if (filter.completed !== undefined && filter.completed !== 'all') {
      const isCompleted =
        filter.completed === 'true' || filter.completed === 'completed';
      query.andWhere('task.completed = :completed', { completed: isCompleted });
    }

    if (filter.priority && filter.priority !== 'all') {
      query.andWhere('task.priority = :priority', {
        priority: filter.priority.toUpperCase(),
      });
    }

    if (filter.category && filter.category !== 'all') {
      query.andWhere('LOWER(task.category) = LOWER(:category)', {
        category: filter.category,
      });
    }

    if (filter.search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${filter.search}%` },
      );
    }

    query.orderBy('task.createdAt', 'DESC');
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        user: true,
        assignedTo: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    const isAdmin =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;
    if (
      !isAdmin &&
      task.userId &&
      task.userId !== user.id &&
      task.assignedToId !== user.id
    ) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    let assignedToId: string | null = null;

    if (createTaskDto.assignedToId) {
      const targetUser = await this.userRepository.findOne({
        where: { id: createTaskDto.assignedToId },
      });

      if (!targetUser) {
        throw new NotFoundException('Assignee user not found');
      }

      if (user.role === UserRole.SUPER_ADMIN) {
        // Super Admin can assign to anyone
        assignedToId = targetUser.id;
      } else if (user.role === UserRole.ADMIN) {
        // Admin can only assign to Members or self
        if (targetUser.role === UserRole.SUPER_ADMIN || (targetUser.role === UserRole.ADMIN && targetUser.id !== user.id)) {
          throw new ForbiddenException('Admins can only assign tasks to Members or to themselves');
        }
        assignedToId = targetUser.id;
      } else {
        // Standard user always assigns to self
        assignedToId = user.id;
      }
    } else {
      // Default: if regular user, assign to self
      if (user.role === UserRole.USER) {
        assignedToId = user.id;
      }
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      userId: user.id,
      assignedToId,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
      category: createTaskDto.category || 'General',
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    });

    const saved = await this.taskRepository.save(task);
    return this.findOne(saved.id, user);
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOne(id, user);

    const isAdmin =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;

    if (updateTaskDto.assignedToId !== undefined) {
      if (!isAdmin) {
        throw new ForbiddenException('Only Admins can reassign tasks');
      }

      if (updateTaskDto.assignedToId) {
        const targetUser = await this.userRepository.findOne({
          where: { id: updateTaskDto.assignedToId },
        });
        if (!targetUser) throw new NotFoundException('Assignee not found');

        if (user.role === UserRole.ADMIN && targetUser.role !== UserRole.USER && targetUser.id !== user.id) {
          throw new ForbiddenException('Admins can only assign tasks to Members or themselves');
        }
        task.assignedToId = targetUser.id;
      } else {
        task.assignedToId = null;
      }
      delete updateTaskDto.assignedToId;
    }

    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined;
      delete updateTaskDto.dueDate;
    }

    Object.assign(task, updateTaskDto);
    await this.taskRepository.save(task);
    return this.findOne(id, user);
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);
    const isAdmin =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;

    if (!isAdmin && task.userId !== user.id) {
      throw new ForbiddenException('You can only delete tasks you created');
    }

    await this.taskRepository.delete(task.id);
  }

  async clearCompleted(user: User): Promise<{ count: number }> {
    const isAdmin =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;

    const query = this.taskRepository
      .createQueryBuilder()
      .delete()
      .from(Task)
      .where('completed = :completed', { completed: true });

    if (!isAdmin) {
      query.andWhere(
        '(userId = :userId OR assignedToId = :userId OR (userId IS NULL AND assignedToId IS NULL))',
        { userId: user.id },
      );
    }

    const result = await query.execute();
    return { count: result.affected || 0 };
  }

  async getStats(user: User, mode: 'admin' | 'personal' = 'admin') {
    const isAdmin =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;
    const isExecutiveAdmin = isAdmin && mode === 'admin';

    if (isExecutiveAdmin) {
      // 6 Comprehensive Executive Widgets for Admin
      const total = await this.taskRepository.count();
      const completed = await this.taskRepository.count({ where: { completed: true } });
      const pending = total - completed;

      const urgentHighCount = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.completed = :completed', { completed: false })
        .andWhere('(task.priority = :urgent OR task.priority = :high)', {
          urgent: TaskPriority.URGENT,
          high: TaskPriority.HIGH,
        })
        .getCount();

      const totalUsersCount = await this.userRepository.count();
      const adminsCount = await this.userRepository.count({
        where: [{ role: UserRole.ADMIN }, { role: UserRole.SUPER_ADMIN }],
      });
      const membersCount = totalUsersCount - adminsCount;

      const assignedCount = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.assignedToId IS NOT NULL')
        .getCount();
      const unassignedCount = total - assignedCount;

      const securityLogsCount = await this.authLogRepository.count();

      // New Metric 1: Overdue & Due Soon
      const now = new Date();
      const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const overdueCount = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.completed = :completed', { completed: false })
        .andWhere('task.dueDate IS NOT NULL')
        .andWhere('task.dueDate < :now', { now })
        .getCount();

      const dueSoonCount = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.completed = :completed', { completed: false })
        .andWhere('task.dueDate IS NOT NULL')
        .andWhere('task.dueDate >= :now AND task.dueDate <= :next48h', { now, next48h })
        .getCount();

      // New Metric 2: Weekly Velocity (Created in last 7 days)
      const createdThisWeekCount = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
        .getCount();

      // New Metric 3: Top Workload Leader
      const topAssigneeRaw = await this.taskRepository
        .createQueryBuilder('task')
        .innerJoin('task.assignedTo', 'assignee')
        .select('assignee.id', 'userId')
        .addSelect('assignee.name', 'name')
        .addSelect('COUNT(task.id)', 'totalAssigned')
        .addSelect(
          'SUM(CASE WHEN task.completed = false THEN 1 ELSE 0 END)',
          'activeAssigned',
        )
        .groupBy('assignee.id')
        .addGroupBy('assignee.name')
        .orderBy('"activeAssigned"', 'DESC')
        .limit(1)
        .getRawOne();

      const topAssignee = topAssigneeRaw
        ? {
            name: topAssigneeRaw.name,
            totalAssigned: parseInt(topAssigneeRaw.totalAssigned || '0', 10),
            activeAssigned: parseInt(topAssigneeRaw.activeAssigned || '0', 10),
          }
        : null;

      const categoriesResult = await this.taskRepository
        .createQueryBuilder('task')
        .select('task.category', 'category')
        .addSelect('COUNT(task.id)', 'count')
        .groupBy('task.category')
        .getRawMany();

      const categories = categoriesResult.reduce((acc, curr) => {
        acc[curr.category] = parseInt(curr.count, 10);
        return acc;
      }, {});

      return {
        total,
        completed,
        pending,
        urgentHighCount,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        activeUsersCount: totalUsersCount,
        adminsCount,
        membersCount,
        assignedCount,
        unassignedCount,
        securityLogsCount,
        overdueCount,
        dueSoonCount,
        createdThisWeekCount,
        topAssignee,
        categories,
        isExecutive: true,
      };
    }

    // Member Personal Stats (or Admin Personal Workspace)
    const personalBase = this.taskRepository
      .createQueryBuilder('task')
      .where(
        '(task.userId = :userId OR task.assignedToId = :userId OR (task.userId IS NULL AND task.assignedToId IS NULL))',
        { userId: user.id },
      );

    const total = await personalBase.getCount();

    const assignedToMe = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.assignedToId = :userId', { userId: user.id })
      .getCount();

    const createdByMe = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId: user.id })
      .getCount();

    const completed = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.completed = :completed', { completed: true })
      .andWhere(
        '(task.userId = :userId OR task.assignedToId = :userId OR (task.userId IS NULL AND task.assignedToId IS NULL))',
        { userId: user.id },
      )
      .getCount();

    const pending = total - completed;

    const urgentHighCount = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.completed = :completed', { completed: false })
      .andWhere('(task.priority = :urgent OR task.priority = :high)', {
        urgent: TaskPriority.URGENT,
        high: TaskPriority.HIGH,
      })
      .andWhere(
        '(task.userId = :userId OR task.assignedToId = :userId OR (task.userId IS NULL AND task.assignedToId IS NULL))',
        { userId: user.id },
      )
      .getCount();

    const categoriesResult = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.category', 'category')
      .addSelect('COUNT(task.id)', 'count')
      .where(
        '(task.userId = :userId OR task.assignedToId = :userId OR (task.userId IS NULL AND task.assignedToId IS NULL))',
        { userId: user.id },
      )
      .groupBy('task.category')
      .getRawMany();

    const categories = categoriesResult.reduce((acc, curr) => {
      acc[curr.category] = parseInt(curr.count, 10);
      return acc;
    }, {});

    return {
      total,
      assignedToMe,
      createdByMe,
      completed,
      pending,
      urgentHighCount,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      categories,
      isExecutive: false,
    };
  }
}
