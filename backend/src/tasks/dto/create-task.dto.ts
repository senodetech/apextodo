import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
