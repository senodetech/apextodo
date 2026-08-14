export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  taskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthLog {
  id: string;
  userId?: string;
  userEmail: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
  createdAt: string;
}
