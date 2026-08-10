import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Task, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface TaskQueryFilter {
  completed?: string;
  priority?: string;
  category?: string;
  search?: string;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll(filter: TaskQueryFilter): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task');

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

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
      category: createTaskDto.category || 'General',
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    });
    return this.taskRepository.save(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    
    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined;
      delete updateTaskDto.dueDate;
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async clearCompleted(): Promise<{ count: number }> {
    const result = await this.taskRepository.delete({ completed: true });
    return { count: result.affected || 0 };
  }

  async getStats() {
    const total = await this.taskRepository.count();
    const completed = await this.taskRepository.count({ where: { completed: true } });
    const pending = total - completed;
    const urgentCount = await this.taskRepository.count({ where: { priority: TaskPriority.URGENT, completed: false } });
    const highCount = await this.taskRepository.count({ where: { priority: TaskPriority.HIGH, completed: false } });
    
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
      urgentCount,
      highCount,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      categories,
    };
  }
}
