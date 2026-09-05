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

  selectKpi(type: 'all' | 'active' | 'urgent' | 'completed') {
    if (type === 'all') {
      this.taskService.setFilter({ completed: 'all', priority: 'all' });
    } else if (type === 'active') {
      this.taskService.setFilter({ completed: 'active', priority: 'all' });
    } else if (type === 'urgent') {
      this.taskService.setFilter({ priority: 'URGENT', completed: 'active' });
    } else if (type === 'completed') {
      this.taskService.setFilter({ completed: 'completed', priority: 'all' });
    }
  }

  isKpiActive(type: 'all' | 'active' | 'urgent' | 'completed'): boolean {
    const f = this.taskService.filter();
    if (type === 'all') {
      return f.completed === 'all' && (!f.priority || f.priority === 'all');
    }
    if (type === 'active') {
      return f.completed === 'active' && (!f.priority || f.priority === 'all');
    }
    if (type === 'urgent') {
      return f.priority === 'URGENT';
    }
    if (type === 'completed') {
      return f.completed === 'completed';
    }
    return false;
  }

  hasActiveFilters(): boolean {
    const f = this.taskService.filter();
    return !!(f.search || (f.priority && f.priority !== 'all') || (f.category && f.category !== 'all') || (f.completed && f.completed !== 'all'));
  }

  resetAllFilters() {
    this.taskService.setFilter({
      search: '',
      priority: 'all',
      category: 'all',
      completed: 'all'
    });
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
