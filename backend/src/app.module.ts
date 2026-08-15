import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Task } from './tasks/entities/task.entity';
import { User } from './users/entities/user.entity';
import { AuthLog } from './auth/entities/auth-log.entity';
import { Notification } from './notifications/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'postgres');

        if (dbType === 'postgres') {
          const dbUrl = config.get<string>('DATABASE_URL');
          const isSsl =
            config.get<string>('DB_SSL') === 'true' ||
            (dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'));

          const basePostgresConfig = {
            type: 'postgres' as const,
            entities: [Task, User, AuthLog, Notification],
            synchronize: true,
            ssl: isSsl ? { rejectUnauthorized: false } : false,
          };

          if (dbUrl) {
            return {
              ...basePostgresConfig,
              url: dbUrl,
            };
          }

          return {
            ...basePostgresConfig,
            host: config.get<string>('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 5432),
            username: config.get<string>('DB_USERNAME', 'postgres'),
            password: config.get<string>('DB_PASSWORD', 'root'),
            database: config.get<string>('DB_NAME', 'todo_db'),
          };
        }

        return {
          type: 'better-sqlite3',
          database: 'todo.sqlite',
          entities: [Task, User, AuthLog, Notification],
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    NotificationsModule,
    TasksModule,
  ],
})
export class AppModule {}
