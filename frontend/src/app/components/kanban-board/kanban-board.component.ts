import { Component, EventEmitter, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
export class KanbanBoardComponent {
  @Output() openEditModal = new EventEmitter<Task>();

  taskService = inject(TaskService);

  todoTasks = computed(() =>
    this.taskService.tasks().filter((t) => !t.completed && t.priority !== TaskPriority.URGENT && t.priority !== TaskPriority.HIGH)
  );

  urgentTasks = computed(() =>
    this.taskService.tasks().filter((t) => !t.completed && (t.priority === TaskPriority.URGENT || t.priority === TaskPriority.HIGH))
  );

  completedTasks = computed(() =>
    this.taskService.tasks().filter((t) => t.completed)
  );

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW: return 'priority-low';
      case TaskPriority.MEDIUM: return 'priority-medium';
      case TaskPriority.HIGH: return 'priority-high';
      case TaskPriority.URGENT: return 'priority-urgent';
      default: return 'priority-medium';
    }
  }
}
