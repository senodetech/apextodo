import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Role must be SUPER_ADMIN, ADMIN, or USER' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;
}
