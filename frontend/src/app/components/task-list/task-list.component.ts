import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  @Output() openCreateModal = new EventEmitter<void>();
  @Output() openEditModal = new EventEmitter<Task>();

  taskService = inject(TaskService);

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW: return 'priority-low';
      case TaskPriority.MEDIUM: return 'priority-medium';
      case TaskPriority.HIGH: return 'priority-high';
      case TaskPriority.URGENT: return 'priority-urgent';
      default: return 'priority-medium';
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }
}
