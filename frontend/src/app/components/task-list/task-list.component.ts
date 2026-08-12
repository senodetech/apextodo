import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="task-list-container">
      <!-- Loading State -->
      <div *ngIf="taskService.loading()" class="loading-state glass-card">
        <div class="spinner"></div>
        <p>Loading tasks...</p>
      </div>

      <!-- Error Banner -->
      <div *ngIf="taskService.error()" class="error-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ taskService.error() }}</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!taskService.loading() && taskService.tasks().length === 0" class="empty-state glass-card">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h3>No Tasks Found</h3>
        <p>Create a new task or adjust your active filters to get started!</p>
        <button class="btn btn-primary" (click)="openCreateModal.emit()">
          + Add New Task
        </button>
      </div>

      <!-- Task Items List -->
      <div *ngIf="!taskService.loading() && taskService.tasks().length > 0" class="list-wrapper">
        <div
          *ngFor="let task of taskService.tasks()"
          class="task-card glass-card"
          [class.completed]="task.completed"
        >
          <!-- Custom Checkbox -->
          <button
            class="checkbox-btn"
            [class.checked]="task.completed"
            (click)="taskService.toggleComplete(task)"
            title="Toggle task completion"
          >
            <svg *ngIf="task.completed" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>

          <!-- Main Content -->
          <div class="task-body">
            <div class="task-title-row">
              <h4 class="task-title">{{ task.title }}</h4>
              <span class="badge-priority" [class]="getPriorityClass(task.priority)">
                {{ task.priority }}
              </span>
            </div>

            <p *ngIf="task.description" class="task-desc">
              {{ task.description }}
            </p>

            <div class="task-meta">
              <span class="category-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                {{ task.category || 'General' }}
              </span>

              <span *ngIf="task.dueDate" class="due-date" [class.overdue]="isOverdue(task)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Due {{ task.dueDate | date:'MMM d, h:mm a' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="task-actions">
            <button class="btn-icon" (click)="openEditModal.emit(task)" title="Edit task">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon text-danger" (click)="taskService.deleteTask(task.id)" title="Delete task">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .task-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 18px 22px;
      transition: all 0.25s ease;
    }
    .task-card:hover {
      transform: translateX(4px);
    }
    .task-card.completed {
      opacity: 0.65;
    }
    .task-card.completed .task-title {
      text-decoration: line-through;
      color: var(--text-muted);
    }

    .checkbox-btn {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: 2px solid var(--border-subtle);
      background: rgba(15, 23, 42, 0.6);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-top: 2px;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .checkbox-btn:hover {
      border-color: var(--accent-primary);
    }
    .checkbox-btn.checked {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      border-color: transparent;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
    }

    .task-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .task-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .task-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
    .task-desc {
      font-size: 0.88rem;
      color: var(--text-secondary);
      margin: 0;
    }
    .task-meta {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .category-tag, .due-date {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.04);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid var(--border-subtle);
    }
    .due-date.overdue {
      color: #fb7185;
      background: rgba(244, 63, 94, 0.1);
      border-color: rgba(244, 63, 94, 0.3);
    }

    .task-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .text-danger:hover {
      color: #fb7185 !important;
    }

    /* States */
    .loading-state, .empty-state {
      padding: 48px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-banner {
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fda4af;
      padding: 12px 18px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `]
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
