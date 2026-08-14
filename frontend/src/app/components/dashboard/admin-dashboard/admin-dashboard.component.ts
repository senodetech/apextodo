import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../../services/task.service';
import { Task, TaskPriority } from '../../../models/task.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="admin-dashboard">
      <!-- 6-Widget Executive Metrics Grid -->
      <section class="metrics-grid">
        <!-- Widget 1: Total Tasks & Completion -->
        <div class="metric-card glass-card">
          <div class="metric-header">
            <span class="metric-label">System Tasks</span>
            <span class="metric-icon">📊</span>
          </div>
          <div class="metric-value">{{ taskService.stats()?.total || 0 }}</div>
          <div class="metric-progress-wrapper">
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                [style.width.%]="taskService.stats()?.completionRate || 0"
              ></div>
            </div>
            <span class="progress-text">{{ taskService.stats()?.completionRate || 0 }}% completed</span>
          </div>
        </div>

        <!-- Widget 2: Active Team Size -->
        <div class="metric-card glass-card">
          <div class="metric-header">
            <span class="metric-label">Team Members</span>
            <span class="metric-icon">👥</span>
          </div>
          <div class="metric-value">{{ taskService.stats()?.activeUsersCount || 0 }}</div>
          <div class="metric-subtext">
            <span class="badge-sub admin">{{ taskService.stats()?.adminsCount || 0 }} Admins</span>
            <span class="badge-sub member">{{ taskService.stats()?.membersCount || 0 }} Members</span>
          </div>
        </div>

        <!-- Widget 3: Critical & Urgent Focus -->
        <div class="metric-card glass-card urgent-highlight">
          <div class="metric-header">
            <span class="metric-label">Critical Action Items</span>
            <span class="metric-icon">🚨</span>
          </div>
          <div class="metric-value critical-val">{{ taskService.stats()?.urgentHighCount || 0 }}</div>
          <div class="metric-subtext warning">Urgent / High Priority Pending</div>
        </div>

        <!-- Widget 4: Task Assignment Distribution -->
        <div class="metric-card glass-card">
          <div class="metric-header">
            <span class="metric-label">Task Assignment</span>
            <span class="metric-icon">📌</span>
          </div>
          <div class="metric-value">{{ taskService.stats()?.assignedCount || 0 }}</div>
          <div class="metric-subtext">
            <span class="text-success">{{ taskService.stats()?.assignedCount || 0 }} Assigned</span>
            <span class="separator">•</span>
            <span class="text-muted">{{ taskService.stats()?.unassignedCount || 0 }} Unassigned</span>
          </div>
        </div>

        <!-- Widget 5: Category Diversity -->
        <div class="metric-card glass-card">
          <div class="metric-header">
            <span class="metric-label">Top Categories</span>
            <span class="metric-icon">🏷️</span>
          </div>
          <div class="category-pills-list">
            <span
              *ngFor="let cat of getTopCategories()"
              class="cat-badge"
            >
              {{ cat.name }}: <strong>{{ cat.count }}</strong>
            </span>
          </div>
        </div>

        <!-- Widget 6: Security & Audit Health -->
        <div class="metric-card glass-card">
          <div class="metric-header">
            <span class="metric-label">Security Audit Logs</span>
            <span class="metric-icon">🛡️</span>
          </div>
          <div class="metric-value">{{ taskService.stats()?.securityLogsCount || 0 }}</div>
          <div class="metric-subtext text-info">
            <span class="status-live-dot"></span> PostgreSQL Audit Active
          </div>
        </div>
      </section>

      <!-- Executive Task Toolbar -->
      <section class="toolbar-section glass-card">
        <div class="toolbar-left">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tasks across company..."
              [ngModel]="taskService.filter().search"
              (ngModelChange)="onSearchChange($event)"
            />
          </div>

          <div class="filter-group">
            <select
              [ngModel]="taskService.filter().priority"
              (ngModelChange)="onPriorityChange($event)"
              class="custom-select"
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
              class="custom-select"
            >
              <option value="all">All Categories</option>
              <option *ngFor="let cat of taskService.categories()" [value]="cat">
                {{ cat }}
              </option>
            </select>

            <select
              [ngModel]="taskService.filter().completed"
              (ngModelChange)="onStatusChange($event)"
              class="custom-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>
        </div>

        <div class="toolbar-right">
          <button class="btn-create" (click)="openCreateModal.emit()">
            <span>+</span> Assign New Task
          </button>
        </div>
      </section>

      <!-- Master Organization Tasks Table -->
      <section class="table-section glass-card">
        <div class="table-header-title">
          <div>
            <h3>Organization Master Task Board</h3>
            <p>Showing full audit trail of creator, assignee, priority, and completion</p>
          </div>
          <div class="table-pagination-top">
            Showing {{ (taskService.page() - 1) * taskService.limit() + (taskService.tasks().length > 0 ? 1 : 0) }} -
            {{ (taskService.page() - 1) * taskService.limit() + taskService.tasks().length }} of {{ taskService.total() }} tasks
          </div>
        </div>

        <div *ngIf="taskService.loading()" class="loading-state">
          <div class="spinner"></div>
          <span>Loading organization tasks...</span>
        </div>

        <div *ngIf="!taskService.loading() && taskService.tasks().length === 0" class="empty-state">
          <span>📋</span>
          <h4>No tasks found</h4>
          <p>Try adjusting your search filters or assign a new task.</p>
        </div>

        <div *ngIf="!taskService.loading() && taskService.tasks().length > 0" class="table-wrapper">
          <table class="tasks-table">
            <thead>
              <tr>
                <th style="width: 48px;">Status</th>
                <th>Task Details</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Created By & Timestamp</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of taskService.tasks()" [class.completed-row]="task.completed">
                <!-- Checkbox -->
                <td>
                  <input
                    type="checkbox"
                    [checked]="task.completed"
                    (change)="taskService.toggleComplete(task)"
                    class="task-check"
                  />
                </td>

                <!-- Title & Description -->
                <td class="task-info-cell">
                  <div class="task-title" [class.line-through]="task.completed">{{ task.title }}</div>
                  <div *ngIf="task.description" class="task-desc">{{ task.description }}</div>
                </td>

                <!-- Priority Badge -->
                <td>
                  <span class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                    {{ task.priority }}
                  </span>
                </td>

                <!-- Category -->
                <td>
                  <span class="category-tag">{{ task.category }}</span>
                </td>

                <!-- Creator & Creation Time -->
                <td class="creator-cell">
                  <div class="creator-name">
                    <span class="user-avatar-mini">{{ getInitials(task.user?.name || 'System') }}</span>
                    <span>{{ task.user?.name || 'System Admin' }}</span>
                  </div>
                  <div class="creator-timestamp">
                    {{ task.createdAt | date:'medium' }}
                  </div>
                </td>

                <!-- Assignee -->
                <td class="assignee-cell">
                  <span *ngIf="task.assignedTo" class="assignee-pill">
                    <span class="assignee-dot"></span>
                    {{ task.assignedTo.name }}
                  </span>
                  <span *ngIf="!task.assignedTo" class="unassigned-pill">
                    Unassigned
                  </span>
                </td>

                <!-- Due Date -->
                <td>
                  <span *ngIf="task.dueDate" class="due-text">{{ task.dueDate | date:'mediumDate' }}</span>
                  <span *ngIf="!task.dueDate" class="no-due">—</span>
                </td>

                <!-- Actions -->
                <td style="text-align: right;">
                  <div class="action-buttons">
                    <button class="btn-action edit" (click)="openEditModal.emit(task)" title="Edit / Reassign">
                      ✏️
                    </button>
                    <button class="btn-action delete" (click)="taskService.deleteTask(task.id)" title="Delete Task">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls (20 tasks per page) -->
        <div class="pagination-footer" *ngIf="taskService.totalPages() > 1 || taskService.total() > 0">
          <div class="pagination-info">
            Page <strong>{{ taskService.page() }}</strong> of <strong>{{ taskService.totalPages() }}</strong> (20 per page)
          </div>
          <div class="pagination-controls">
            <button
              class="btn-page"
              [disabled]="taskService.page() === 1"
              (click)="taskService.prevPage()"
            >
              ← Previous
            </button>

            <button
              *ngFor="let p of getPageArray()"
              class="btn-page-num"
              [class.active]="p === taskService.page()"
              (click)="taskService.setPage(p)"
            >
              {{ p }}
            </button>

            <button
              class="btn-page"
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
    .admin-dashboard {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .metric-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .metric-card.urgent-highlight {
      border-color: rgba(239, 68, 68, 0.3);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(20, 26, 46, 0.8) 100%);
    }
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .metric-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-icon {
      font-size: 1.25rem;
    }
    .metric-value {
      font-size: 2rem;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1;
    }
    .critical-val {
      color: #f87171;
    }
    .metric-progress-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .progress-bar-bg {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #10b981);
      border-radius: 999px;
      transition: width 0.4s ease;
    }
    .progress-text {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .metric-subtext {
      font-size: 0.78rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-sub {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .badge-sub.admin {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
    }
    .badge-sub.member {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
    }
    .category-pills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .cat-badge {
      font-size: 0.72rem;
      padding: 3px 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      color: #cbd5e1;
    }
    .status-live-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .toolbar-section {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      flex: 1;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px 14px;
      border-radius: 10px;
      min-width: 260px;
    }
    .search-box input {
      background: none;
      border: none;
      outline: none;
      color: #f8fafc;
      font-size: 0.85rem;
      width: 100%;
    }
    .filter-group {
      display: flex;
      gap: 10px;
    }
    .custom-select {
      background: rgba(20, 26, 46, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      outline: none;
      cursor: pointer;
    }
    .btn-create {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.2s;
    }
    .btn-create:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
    }
    .table-section {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .table-header-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .table-header-title h3 {
      margin: 0 0 4px;
      font-size: 1.15rem;
      font-weight: 700;
      color: #f1f5f9;
    }
    .table-header-title p {
      margin: 0;
      font-size: 0.82rem;
      color: #94a3b8;
    }
    .table-pagination-top {
      font-size: 0.82rem;
      color: #94a3b8;
      font-weight: 500;
    }
    .table-wrapper {
      overflow-x: auto;
    }
    .tasks-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .tasks-table th {
      text-align: left;
      padding: 12px 14px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .tasks-table td {
      padding: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
      vertical-align: middle;
    }
    .tasks-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .completed-row td {
      opacity: 0.6;
    }
    .task-check {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #10b981;
    }
    .task-info-cell {
      max-width: 280px;
    }
    .task-title {
      font-weight: 600;
      color: #f8fafc;
    }
    .task-title.line-through {
      text-decoration: line-through;
    }
    .task-desc {
      font-size: 0.78rem;
      color: #94a3b8;
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .priority-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .priority-badge.urgent {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .priority-badge.high {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .priority-badge.medium {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .priority-badge.low {
      background: rgba(100, 116, 139, 0.15);
      color: #94a3b8;
      border: 1px solid rgba(100, 116, 139, 0.3);
    }
    .category-tag {
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
    }
    .creator-cell {
      min-width: 180px;
    }
    .creator-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 0.82rem;
      color: #f1f5f9;
    }
    .user-avatar-mini {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .creator-timestamp {
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 2px;
    }
    .assignee-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .assignee-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }
    .unassigned-pill {
      font-size: 0.75rem;
      color: #64748b;
      font-style: italic;
    }
    .due-text {
      font-size: 0.8rem;
      color: #cbd5e1;
    }
    .no-due {
      color: #64748b;
    }
    .action-buttons {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-action.edit:hover {
      background: rgba(59, 130, 246, 0.2);
    }
    .btn-action.delete:hover {
      background: rgba(239, 68, 68, 0.2);
    }
    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
      gap: 12px;
    }
    .pagination-info {
      font-size: 0.82rem;
      color: #94a3b8;
    }
    .pagination-controls {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .btn-page {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-page:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    .btn-page:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .btn-page-num {
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
    .btn-page-num.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
      font-weight: 700;
    }
    .loading-state, .empty-state {
      padding: 40px;
      text-align: center;
      color: #94a3b8;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
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
