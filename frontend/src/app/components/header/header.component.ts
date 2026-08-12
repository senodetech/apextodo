import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <header class="app-header glass-card">
      <div class="brand">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <div class="brand-text">
          <h1>Apex<span class="highlight">Tasks</span></h1>
          <p class="subtitle">Angular 19 & NestJS Todo Workspace</p>
        </div>
      </div>

      <div class="header-right">
        <div class="date-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{{ today | date:'EEEE, MMM d, y' }}</span>
        </div>

        <button class="btn btn-primary" (click)="openCreateModal.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>New Task</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 28px;
      margin-bottom: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .brand-text h1 {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.5px;
      margin: 0;
      line-height: 1.2;
    }
    .highlight {
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin: 0;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .date-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    @media (max-width: 640px) {
      .app-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .header-right { width: 100%; justify-content: space-between; }
    }
  `]
})
export class HeaderComponent {
  @Output() openCreateModal = new EventEmitter<void>();
  today = new Date();
  taskService = inject(TaskService);
}
