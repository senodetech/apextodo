import { Component, EventEmitter, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kanban-grid">
      <!-- Column: To Do (Pending Medium/Low) -->
      <div class="kanban-column glass-card">
        <div class="column-header header-todo">
          <div class="header-title">
            <span class="dot dot-todo"></span>
            <h3>To Do</h3>
          </div>
          <span class="count-badge">{{ todoTasks().length }}</span>
        </div>

        <div class="cards-list">
          <div
            *ngFor="let task of todoTasks()"
            class="kanban-card glass-card"
          >
            <div class="card-top">
              <span class="badge-priority" [class]="getPriorityClass(task.priority)">{{ task.priority }}</span>
              <div class="card-actions">
                <button class="btn-icon" (click)="openEditModal.emit(task)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
            </div>

            <h4 class="card-title">{{ task.title }}</h4>
            <p *ngIf="task.description" class="card-desc">{{ task.description }}</p>

            <div class="card-footer">
              <span class="category-tag">{{ task.category || 'General' }}</span>
              <button class="btn-move" (click)="taskService.toggleComplete(task)">
                Mark Complete →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Column: Urgent & High Focus -->
      <div class="kanban-column glass-card">
        <div class="column-header header-urgent">
          <div class="header-title">
            <span class="dot dot-urgent"></span>
            <h3>High Priority / Urgent</h3>
          </div>
          <span class="count-badge count-urgent">{{ urgentTasks().length }}</span>
        </div>

        <div class="cards-list">
          <div
            *ngFor="let task of urgentTasks()"
            class="kanban-card glass-card border-urgent"
          >
            <div class="card-top">
              <span class="badge-priority" [class]="getPriorityClass(task.priority)">{{ task.priority }}</span>
              <div class="card-actions">
                <button class="btn-icon" (click)="openEditModal.emit(task)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
            </div>

            <h4 class="card-title">{{ task.title }}</h4>
            <p *ngIf="task.description" class="card-desc">{{ task.description }}</p>

            <div class="card-footer">
              <span class="category-tag">{{ task.category || 'General' }}</span>
              <button class="btn-move" (click)="taskService.toggleComplete(task)">
                Mark Complete →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Column: Completed -->
      <div class="kanban-column glass-card">
        <div class="column-header header-completed">
          <div class="header-title">
            <span class="dot dot-completed"></span>
            <h3>Completed</h3>
          </div>
          <span class="count-badge count-completed">{{ completedTasks().length }}</span>
        </div>

        <div class="cards-list">
          <div
            *ngFor="let task of completedTasks()"
            class="kanban-card glass-card is-done"
          >
            <div class="card-top">
              <span class="badge-priority" [class]="getPriorityClass(task.priority)">{{ task.priority }}</span>
              <button class="btn-icon text-danger" (click)="taskService.deleteTask(task.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                </svg>
              </button>
            </div>

            <h4 class="card-title strikethrough">{{ task.title }}</h4>

            <div class="card-footer">
              <span class="category-tag">{{ task.category }}</span>
              <button class="btn-move btn-reopen" (click)="taskService.toggleComplete(task)">
                ↺ Reopen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .kanban-column {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 500px;
    }
    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .header-title { display: flex; align-items: center; gap: 8px; }
    .header-title h3 { font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0; }
    
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot-todo { background: #38bdf8; box-shadow: 0 0 8px #38bdf8; }
    .dot-urgent { background: #f43f5e; box-shadow: 0 0 8px #f43f5e; }
    .dot-completed { background: #34d399; box-shadow: 0 0 8px #34d399; }

    .count-badge {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-secondary);
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .count-urgent { background: rgba(244, 63, 94, 0.2); color: #fb7185; }
    .count-completed { background: rgba(16, 185, 129, 0.2); color: #34d399; }

    .cards-list { display: flex; flex-direction: column; gap: 12px; flex: 1; }

    .kanban-card {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(15, 23, 42, 0.6);
    }
    .border-urgent { border-left: 3px solid #f43f5e; }
    .is-done { opacity: 0.6; }

    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .card-title { font-size: 0.95rem; font-weight: 600; color: #fff; margin: 0; }
    .strikethrough { text-decoration: line-through; color: var(--text-muted); }
    .card-desc { font-size: 0.82rem; color: var(--text-secondary); margin: 0; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
    .category-tag { font-size: 0.75rem; color: var(--text-muted); background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 4px; }
    
    .btn-move {
      background: transparent;
      border: none;
      color: var(--accent-primary);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    .btn-move:hover { background: rgba(99, 102, 241, 0.15); }
    .btn-reopen { color: #34d399; }
    .btn-reopen:hover { background: rgba(16, 185, 129, 0.15); }
  `]
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
