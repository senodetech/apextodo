import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/entities/task.entity';

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
            password: config.get<string>('DB_PASSWORD', 'postgres'),
            database: config.get<string>('DB_NAME', 'todo_db'),
            entities: [Task],
            synchronize: true,
          };
        }

        return {
          type: 'better-sqlite3',
          database: 'todo.sqlite',
          entities: [Task],
          synchronize: true,
        };
      },
    }),
    TasksModule,
  ],
})
export class AppModule {}
