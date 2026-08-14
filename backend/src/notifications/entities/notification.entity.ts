import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  MEMBER_CREATED = 'MEMBER_CREATED',
  MEMBER_UPDATED = 'MEMBER_UPDATED',
  MEMBER_DELETED = 'MEMBER_DELETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 255 })
  actorEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetEmail?: string;

  @Column({ type: 'varchar', length: 50, default: NotificationType.MEMBER_CREATED })
  type: NotificationType | string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
