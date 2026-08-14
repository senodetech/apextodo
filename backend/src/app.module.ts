import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Task } from './tasks/entities/task.entity';
import { User } from './users/entities/user.entity';
import { AuthLog } from './auth/entities/auth-log.entity';

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
          return {
            type: 'postgres',
            host: config.get<string>('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 5432),
            username: config.get<string>('DB_USERNAME', 'postgres'),
            password: config.get<string>('DB_PASSWORD', 'root'),
            database: config.get<string>('DB_NAME', 'todo_db'),
            entities: [Task, User, AuthLog],
            synchronize: true,
          };
        }

        return {
          type: 'better-sqlite3',
          database: 'todo.sqlite',
          entities: [Task, User, AuthLog],
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}
