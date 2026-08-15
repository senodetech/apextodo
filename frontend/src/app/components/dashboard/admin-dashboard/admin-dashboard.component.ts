import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../../services/task.service';
import { Task, TaskPriority } from '../../../models/task.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  @Output() openCreateModal = new EventEmitter<void>();
  @Output() openEditModal = new EventEmitter<Task>();

  taskService = inject(TaskService);

  onSearchChange(search: string) {
    this.taskService.setFilter({ search });
  }

  onPriorityChange(priority: string) {
    this.taskService.setFilter({ priority });
  }

  onCategoryChange(category: string) {
    this.taskService.setFilter({ category });
  }

  onStatusChange(completed: 'all' | 'active' | 'completed') {
    this.taskService.setFilter({ completed });
  }

  getTopCategories(): { name: string; count: number }[] {
    const cats = this.taskService.stats()?.categories || {};
    return Object.entries(cats)
      .map(([name, count]) => ({ name, count: Number(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getPageArray(): number[] {
    const total = this.taskService.totalPages();
    const current = this.taskService.page();
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
        pages.push(i);
      }
    }
    return pages;
  }
}
