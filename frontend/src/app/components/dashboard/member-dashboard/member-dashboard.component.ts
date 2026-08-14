import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
  template: `
    <div class="member-dashboard">
      <!-- Personal Key Metrics Cards -->
      <section class="personal-stats-grid">
        <div class="stat-card glass-card">
          <div class="stat-icon-bg icon-total">📋</div>
          <div class="stat-info">
            <span class="stat-label">My Total Tasks</span>
            <span class="stat-value">{{ taskService.stats()?.total || 0 }}</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon-bg icon-assigned">📥</div>
          <div class="stat-info">
            <span class="stat-label">Assigned to Me</span>
            <span class="stat-value text-blue">{{ taskService.stats()?.assignedToMe || 0 }}</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon-bg icon-created">✍️</div>
          <div class="stat-info">
            <span class="stat-label">Created by Me</span>
            <span class="stat-value text-purple">{{ taskService.stats()?.createdByMe || 0 }}</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon-bg icon-completed">✅</div>
          <div class="stat-info">
            <span class="stat-label">Completed</span>
            <span class="stat-value text-green">{{ taskService.stats()?.completed || 0 }}</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon-bg icon-pending">⏳</div>
          <div class="stat-info">
            <span class="stat-label">Pending</span>
            <span class="stat-value text-amber">{{ taskService.stats()?.pending || 0 }}</span>
          </div>
        </div>
      </section>

      <!-- Scope Tabs & Toolbar -->
      <section class="toolbar-wrapper glass-card">
        <!-- Scope Tabs: All vs Assigned vs Created -->
        <div class="scope-tabs">
          <button
            class="tab-btn"
            [class.active]="taskService.memberScope() === 'all'"
            (click)="onScopeChange('all')"
          >
            All Workspace Tasks
          </button>
          <button
            class="tab-btn"
            [class.active]="taskService.memberScope() === 'assigned'"
            (click)="onScopeChange('assigned')"
          >
            📥 Assigned to Me
          </button>
          <button
            class="tab-btn"
            [class.active]="taskService.memberScope() === 'created'"
            (click)="onScopeChange('created')"
          >
            ✍️ Created by Me
          </button>
        </div>

        <!-- Filter Controls & View Switcher -->
        <div class="toolbar-controls">
          <div class="search-input-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Filter tasks..."
              [ngModel]="taskService.filter().search"
              (ngModelChange)="onSearchChange($event)"
            />
          </div>

          <select
            [ngModel]="taskService.filter().priority"
            (ngModelChange)="onPriorityChange($event)"
            class="select-control"
          >
            <option value="all">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            [ngModel]="taskService.filter().category"
            (ngModelChange)="onCategoryChange($event)"
            class="select-control"
          >
            <option value="all">All Categories</option>
            <option *ngFor="let cat of taskService.categories()" [value]="cat">
              {{ cat }}
            </option>
          </select>

          <!-- View Mode (List vs Kanban) -->
          <div class="view-toggle-pills">
            <button
              class="pill-btn"
              [class.active]="currentView === 'list'"
              (click)="currentView = 'list'"
              title="List View"
            >
              ☰
            </button>
            <button
              class="pill-btn"
              [class.active]="currentView === 'kanban'"
              (click)="currentView = 'kanban'"
              title="Kanban View"
            >
              ☷
            </button>
          </div>

          <button class="btn-add" (click)="openCreateModal.emit()">
            + New Task
          </button>
        </div>
      </section>

      <!-- Task Content Views (List or Kanban) -->
      <section class="task-content">
        <ng-container [ngSwitch]="currentView">
          <app-task-list
            *ngSwitchCase="'list'"
            (openCreateModal)="openCreateModal.emit()"
            (openEditModal)="openEditModal.emit($event)"
          ></app-task-list>

          <app-kanban-board
            *ngSwitchCase="'kanban'"
            (openEditModal)="openEditModal.emit($event)"
          ></app-kanban-board>
        </ng-container>

        <!-- 20 Tasks/Page Pagination Footer -->
        <div
          class="pagination-bar glass-card"
          *ngIf="taskService.totalPages() > 1 || taskService.total() > 0"
        >
          <div class="pagination-count">
            Showing {{ (taskService.page() - 1) * taskService.limit() + (taskService.tasks().length > 0 ? 1 : 0) }} -
            {{ (taskService.page() - 1) * taskService.limit() + taskService.tasks().length }} of {{ taskService.total() }} tasks (20 per page)
          </div>
          <div class="pagination-buttons">
            <button
              class="btn-pagination"
              [disabled]="taskService.page() === 1"
              (click)="taskService.prevPage()"
            >
              ← Prev
            </button>

            <button
              *ngFor="let p of getPageNumbers()"
              class="btn-page-index"
              [class.active]="p === taskService.page()"
              (click)="taskService.setPage(p)"
            >
              {{ p }}
            </button>

            <button
              class="btn-pagination"
              [disabled]="taskService.page() === taskService.totalPages()"
              (click)="taskService.nextPage()"
            >
              Next →
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .member-dashboard {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .personal-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 16px;
    }
    .stat-card {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .stat-icon-bg {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .icon-total {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .icon-assigned {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .icon-created {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
    }
    .icon-completed {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .icon-pending {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 0.76rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #f8fafc;
    }
    .text-blue { color: #60a5fa; }
    .text-purple { color: #c084fc; }
    .text-green { color: #34d399; }
    .text-amber { color: #fbbf24; }

    .toolbar-wrapper {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .scope-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
      overflow-x: auto;
    }
    .tab-btn {
      background: none;
      border: none;
      color: #94a3b8;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: #f1f5f9;
      background: rgba(255, 255, 255, 0.04);
    }
    .tab-btn.active {
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
    }
    .toolbar-controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .search-input-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px 12px;
      border-radius: 8px;
      flex: 1;
      min-width: 200px;
    }
    .search-input-box input {
      background: none;
      border: none;
      outline: none;
      color: white;
      font-size: 0.84rem;
      width: 100%;
    }
    .select-control {
      background: rgba(20, 26, 46, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      outline: none;
      cursor: pointer;
    }
    .view-toggle-pills {
      display: flex;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 3px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .pill-btn {
      background: none;
      border: none;
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .pill-btn.active {
      background: #3b82f6;
      color: white;
    }
    .btn-add {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-add:hover {
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    }
    .task-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .pagination-bar {
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .pagination-count {
      font-size: 0.82rem;
      color: #94a3b8;
    }
    .pagination-buttons {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-pagination {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-pagination:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    .btn-pagination:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .btn-page-index {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      font-size: 0.82rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-page-index.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
      font-weight: 700;
    }
  `]
})
export class MemberDashboardComponent {
  @Output() openCreateModal = new EventEmitter<void>();
  @Output() openEditModal = new EventEmitter<Task>();

  taskService = inject(TaskService);
  currentView: 'list' | 'kanban' = 'list';

  onScopeChange(scope: 'all' | 'assigned' | 'created') {
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
