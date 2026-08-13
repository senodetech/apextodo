import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UsersService } from '../users/users.service';

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
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    const defaultUser = await this.usersService.findOrCreateUser({
      email: 'senapathybglore@gmail.com',
      displayName: 'Senapathy (Google OAuth)',
      provider: 'google',
    });

    const unassignedTasks = await this.taskRepository.find({ where: { userId: undefined } });
    if (unassignedTasks.length > 0) {
      for (const t of unassignedTasks) {
        t.userId = defaultUser.id;
      }
      await this.taskRepository.save(unassignedTasks);
      console.log(`[TasksService] Migrated ${unassignedTasks.length} legacy tasks to user ${defaultUser.email}`);
    }

    const count = await this.taskRepository.count({ where: { userId: defaultUser.id } });
    if (count === 0) {
      console.log('[TasksService] Seeding initial tasks for default user...');
      await this.seedInitialTasks(defaultUser.id);
    }
  }

  async seedInitialTasks(userId: string): Promise<Task[]> {
    const sampleTasks = [
      {
        title: 'Setup PostgreSQL & TypeORM Database',
        description: 'Configure todo_db schema synchronization, connection pool, and TypeORM entity models.',
        completed: true,
        priority: TaskPriority.URGENT,
        category: 'Database',
        userId,
      },
      {
        title: 'Build Angular 19 Standalone Signals UI',
        description: 'Implement reactive state management using Signal store, Glassmorphic theme tokens, and custom CSS.',
        completed: true,
        priority: TaskPriority.HIGH,
        category: 'Frontend',
        userId,
      },
      {
        title: 'Deploy NestJS REST API Controller & DTOs',
        description: 'Create CRUD endpoints, request payload validation pipes, and CORS integration middleware.',
        completed: false,
        priority: TaskPriority.HIGH,
        category: 'Backend',
        userId,
      },
      {
        title: 'Implement Interactive Kanban Board View',
        description: 'Enable dual-view layout switching between standard list view and column-based Kanban workspace.',
        completed: false,
        priority: TaskPriority.MEDIUM,
        category: 'Frontend',
        userId,
      },
      {
        title: 'Configure OAuth2 Authentication & NestJS Guards',
        description: 'Protect task routes using JwtAuthGuard and isolate multi-tenant user task workspaces.',
        completed: true,
        priority: TaskPriority.HIGH,
        category: 'Security',
        userId,
      },
    ];

    const tasks = this.taskRepository.create(sampleTasks);
    return this.taskRepository.save(tasks);
  }

  async findAll(filter: TaskQueryFilter, userId: string): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task')
      .where('task.userId = :userId', { userId });

    if (filter.completed !== undefined && filter.completed !== 'all') {
      const isCompleted = filter.completed === 'true' || filter.completed === 'completed';
      query.andWhere('task.completed = :completed', { completed: isCompleted });
    }

    if (filter.priority && filter.priority !== 'all') {
      query.andWhere('task.priority = :priority', { priority: filter.priority.toUpperCase() });
    }

    if (filter.category && filter.category !== 'all') {
      query.andWhere('LOWER(task.category) = LOWER(:category)', { category: filter.category });
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

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id, userId } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
      category: createTaskDto.category || 'General',
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      userId,
    });
    return this.taskRepository.save(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    
    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined;
      delete updateTaskDto.dueDate;
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
  }

  async clearCompleted(userId: string): Promise<{ count: number }> {
    const result = await this.taskRepository.delete({ userId, completed: true });
    return { count: result.affected || 0 };
  }

  async getStats(userId: string) {
    const total = await this.taskRepository.count({ where: { userId } });
    const completed = await this.taskRepository.count({ where: { userId, completed: true } });
    const pending = total - completed;
    const urgentCount = await this.taskRepository.count({ where: { userId, priority: TaskPriority.URGENT, completed: false } });
    const highCount = await this.taskRepository.count({ where: { userId, priority: TaskPriority.HIGH, completed: false } });
    
    const categoriesResult = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.category', 'category')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.userId = :userId', { userId })
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
      urgentCount,
      highCount,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      categories,
    };
  }
}
