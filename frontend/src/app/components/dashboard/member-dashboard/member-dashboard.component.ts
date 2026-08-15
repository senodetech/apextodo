import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';
import { FormsModule } from '@angular/forms';
import { TaskListComponent } from '../../task-list/task-list.component';
import { KanbanBoardComponent } from '../../kanban-board/kanban-board.component';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskListComponent,
    KanbanBoardComponent,
  ],
  templateUrl: './member-dashboard.component.html',
  styleUrl: './member-dashboard.component.css'
})
export class MemberDashboardComponent {
  @Output() openCreateModal = new EventEmitter<void>();
  @Output() openEditModal = new EventEmitter<Task>();

  taskService = inject(TaskService);
  currentView: 'list' | 'kanban' = 'list';

  onScopeChange(scope: 'assigned' | 'delegated' | 'created' | 'all') {
    this.taskService.setMemberScope(scope);
  }

  onSearchChange(search: string) {
    this.taskService.setFilter({ search });
  }

  onPriorityChange(priority: string) {
    this.taskService.setFilter({ priority });
  }

  onCategoryChange(category: string) {
    this.taskService.setFilter({ category });
  }

  getPageNumbers(): number[] {
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
