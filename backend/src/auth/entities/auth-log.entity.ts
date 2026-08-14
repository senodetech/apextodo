import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuthLogAction {
  REGISTER = 'REGISTER',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  LOGOUT = 'LOGOUT',
  USER_CREATED_BY_ADMIN = 'USER_CREATED_BY_ADMIN',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_DELETED = 'USER_DELETED',
}

@Entity('auth_logs')
export class AuthLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string | null;

  @ManyToOne(() => User, (user) => user.authLogs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User | null;

  @Column({ type: 'varchar', length: 255 })
  userEmail: string;

  @Column({ type: 'varchar', length: 50 })
  action: AuthLogAction | string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 20, default: 'SUCCESS' })
  status: 'SUCCESS' | 'FAILURE';

  @Column({ type: 'text', nullable: true })
  details?: string;

  @CreateDateColumn()
  createdAt: Date;
}
