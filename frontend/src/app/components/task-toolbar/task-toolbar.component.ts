import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-toolbar.component.html',
  styleUrl: './task-toolbar.component.css'
})
export class TaskToolbarComponent {
  @Input() currentView: 'list' | 'kanban' = 'list';
  @Output() viewChange = new EventEmitter<'list' | 'kanban'>();

  taskService = inject(TaskService);
  searchQuery = '';

  setStatusFilter(status: 'all' | 'active' | 'completed') {
    this.taskService.setFilter({ completed: status });
  }

  onPriorityChange(priority: string) {
    this.taskService.setFilter({ priority });
  }

  onSearchChange(query: string) {
    this.taskService.setFilter({ search: query });
  }
}
