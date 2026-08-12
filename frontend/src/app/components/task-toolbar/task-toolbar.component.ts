import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="toolbar glass-card">
      <!-- Search Input -->
      <div class="search-box">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Search tasks..."
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
        />
      </div>

      <!-- Filters & Actions -->
      <div class="filters-row">
        <!-- Status Pills -->
        <div class="status-pills">
          <button
            class="pill"
            [class.active]="taskService.filter().completed === 'all'"
            (click)="setStatusFilter('all')"
          >
            All
          </button>
          <button
            class="pill"
            [class.active]="taskService.filter().completed === 'active'"
            (click)="setStatusFilter('active')"
          >
            Active
          </button>
          <button
            class="pill"
            [class.active]="taskService.filter().completed === 'completed'"
            (click)="setStatusFilter('completed')"
          >
            Completed
          </button>
        </div>

        <!-- Priority Select -->
        <select
          class="form-select select-sm"
          [ngModel]="taskService.filter().priority"
          (ngModelChange)="onPriorityChange($event)"
        >
          <option value="all">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <!-- View Switcher -->
        <div class="view-toggle">
          <button
            class="toggle-btn"
            [class.active]="currentView === 'list'"
            (click)="viewChange.emit('list')"
            title="List View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <button
            class="toggle-btn"
            [class.active]="currentView === 'kanban'"
            (click)="viewChange.emit('kanban')"
            title="Kanban Board View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="18" rx="1"/>
              <rect x="14" y="3" width="7" height="11" rx="1"/>
            </svg>
          </button>
        </div>

        <!-- Clear Completed -->
        <button
          *ngIf="taskService.completedCount() > 0"
          class="btn btn-danger btn-sm"
          (click)="taskService.clearCompleted()"
          title="Clear all completed tasks"
        >
          Clear Completed ({{ taskService.completedCount() }})
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
    }
    .search-box {
      position: relative;
      flex: 1;
      min-width: 240px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    .search-input {
      padding-left: 42px;
    }
    .filters-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
    .status-pills {
      display: flex;
      background: rgba(15, 23, 42, 0.6);
      padding: 4px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .pill {
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pill.active {
      background: var(--accent-primary);
      color: #fff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }
    .select-sm {
      padding: 8px 12px;
      font-size: 0.85rem;
      width: auto;
    }
    .view-toggle {
      display: flex;
      background: rgba(15, 23, 42, 0.6);
      padding: 4px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .toggle-btn {
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
    }
    .toggle-btn.active {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text-primary);
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.82rem;
    }
  `]
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
