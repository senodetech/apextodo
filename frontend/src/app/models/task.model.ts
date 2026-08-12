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
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  completed: 'all' | 'active' | 'completed';
  priority: string;
  category: string;
  search: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  urgentCount: number;
  highCount: number;
  completionRate: number;
  categories: Record<string, number>;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  completed?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string;
  completed?: boolean;
}
