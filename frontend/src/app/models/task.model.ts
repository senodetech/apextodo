export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  category: string;
  dueDate?: string;
  userId?: string;
  user?: { id?: string; name: string; email: string; role: string };
  assignedToId?: string;
  assignedTo?: { id?: string; name: string; email: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskFilter {
  completed: 'all' | 'active' | 'completed';
  priority: string;
  category: string;
  search: string;
  assignedToId?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  urgentHighCount: number;
  completionRate: number;
  categories: Record<string, number>;
  // Executive Admin 6-widget metrics
  activeUsersCount?: number;
  adminsCount?: number;
  membersCount?: number;
  assignedCount?: number;
  unassignedCount?: number;
  securityLogsCount?: number;
  isExecutive?: boolean;
  // Member Personal metrics
  assignedToMe?: number;
  createdByMe?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  completed?: boolean;
  assignedToId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  completed?: boolean;
  assignedToId?: string;
}
