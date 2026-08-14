import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';
import type { Request } from 'express';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('assignable')
  getAssignableUsers(@CurrentUser() user: User) {
    return this.usersService.getAssignableUsers(user);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() creator: User,
    @Req() req: Request,
  ) {
    return this.usersService.createUser(createUserDto, creator, req);
  }

  @Patch(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @CurrentUser() creator: User,
    @Req() req: Request,
  ) {
    return this.usersService.updateUserRole(id, updateRoleDto, creator, req);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(
    @Param('id') id: string,
    @CurrentUser() creator: User,
    @Req() req: Request,
  ) {
    return this.usersService.deleteUser(id, creator, req);
  }
}
