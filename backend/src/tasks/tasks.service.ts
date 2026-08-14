import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User, UserRole } from '../users/entities/user.entity';

export interface TaskQueryFilter {
  completed?: string;
  priority?: string;
  category?: string;
  search?: string;
}

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
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

  async findAll(filter: TaskQueryFilter, user: User): Promise<Task[]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user');

    // Role-based task scoping
    const isAdmin =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;
    if (!isAdmin) {
      query.andWhere('(task.userId = :userId OR task.userId IS NULL)', {
        userId: user.id,
      });
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
    return query.getMany();
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    const isAdmin =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;
    if (!isAdmin && task.userId && task.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId: user.id,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
      category: createTaskDto.category || 'General',
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    });
    return this.taskRepository.save(task);
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOne(id, user);

    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined;
      delete updateTaskDto.dueDate;
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);
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
      query.andWhere('(userId = :userId OR userId IS NULL)', { userId: user.id });
    }

    const result = await query.execute();
    return { count: result.affected || 0 };
  }

  async getStats(user: User) {
    const isAdmin =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;

    const baseQuery = this.taskRepository.createQueryBuilder('task');
    if (!isAdmin) {
      baseQuery.where('(task.userId = :userId OR task.userId IS NULL)', {
        userId: user.id,
      });
    }

    const total = await baseQuery.getCount();

    const completedQuery = this.taskRepository
      .createQueryBuilder('task')
      .where('task.completed = :completed', { completed: true });
    if (!isAdmin) {
      completedQuery.andWhere('(task.userId = :userId OR task.userId IS NULL)', {
        userId: user.id,
      });
    }
    const completed = await completedQuery.getCount();

    const pending = total - completed;

    const urgentQuery = this.taskRepository
      .createQueryBuilder('task')
      .where('task.priority = :priority', { priority: TaskPriority.URGENT })
      .andWhere('task.completed = :completed', { completed: false });
    if (!isAdmin) {
      urgentQuery.andWhere('(task.userId = :userId OR task.userId IS NULL)', {
        userId: user.id,
      });
    }
    const urgentCount = await urgentQuery.getCount();

    const highQuery = this.taskRepository
      .createQueryBuilder('task')
      .where('task.priority = :priority', { priority: TaskPriority.HIGH })
      .andWhere('task.completed = :completed', { completed: false });
    if (!isAdmin) {
      highQuery.andWhere('(task.userId = :userId OR task.userId IS NULL)', {
        userId: user.id,
      });
    }
    const highCount = await highQuery.getCount();

    const categoriesQuery = this.taskRepository
      .createQueryBuilder('task')
      .select('task.category', 'category')
      .addSelect('COUNT(task.id)', 'count');
    if (!isAdmin) {
      categoriesQuery.where('(task.userId = :userId OR task.userId IS NULL)', {
        userId: user.id,
      });
    }
    const categoriesResult = await categoriesQuery.groupBy('task.category').getRawMany();

    const categories = categoriesResult.reduce((acc, curr) => {
      acc[curr.category] = parseInt(curr.count, 10);
      return acc;
    }, {});

    return {
      total,
      completed,
      pending,
      urgentCount,
      highCount,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      categories,
    };
  }
}
