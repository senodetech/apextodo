import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ type: 'varchar', length: 100, default: 'General' })
  category: string;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ type: 'uuid', nullable: true })
  userId?: string | null;

  @ManyToOne(() => User, (user) => user.tasks, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User | null;

  @Column({ type: 'uuid', nullable: true })
  assignedToId?: string | null;

  @ManyToOne(() => User, (user) => user.assignedTasks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

