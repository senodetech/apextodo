import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { TaskQueryFilter } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query() filter: TaskQueryFilter, @CurrentUser() user: User) {
    return this.tasksService.findAll(filter, user);
  }

  @Get('stats')
  getStats(
    @CurrentUser() user: User,
    @Query('mode') mode?: 'admin' | 'personal',
  ) {
    return this.tasksService.getStats(user, mode || 'admin');
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.findOne(id, user);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Post('seed')
  seed() {
    return this.tasksService.seedInitialTasks();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete('completed/clear')
  @HttpCode(HttpStatus.OK)
  clearCompleted(@CurrentUser() user: User) {
    return this.tasksService.clearCompleted(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.remove(id, user);
  }
}
