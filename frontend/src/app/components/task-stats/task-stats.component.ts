import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      <!-- Total Tasks Card -->
      <div class="stat-card glass-card">
        <div class="stat-icon icon-indigo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Tasks</span>
          <h3 class="stat-value">{{ taskService.stats()?.total ?? taskService.tasks().length }}</h3>
        </div>
      </div>

      <!-- Completed Tasks Card -->
      <div class="stat-card glass-card">
        <div class="stat-icon icon-emerald">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Completed</span>
          <h3 class="stat-value text-emerald">{{ taskService.completedCount() }}</h3>
        </div>
      </div>

      <!-- Pending Tasks Card -->
      <div class="stat-card glass-card">
        <div class="stat-icon icon-amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Active / Pending</span>
          <h3 class="stat-value text-amber">{{ taskService.activeCount() }}</h3>
        </div>
      </div>

      <!-- Completion Rate Card -->
      <div class="stat-card glass-card">
        <div class="stat-icon icon-purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
        <div class="stat-info fill-width">
          <div class="stat-header">
            <span class="stat-label">Progress</span>
            <span class="stat-percent">{{ taskService.stats()?.completionRate ?? 0 }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" [style.width.%]="taskService.stats()?.completionRate ?? 0"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .icon-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .icon-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

    .stat-info { display: flex; flex-direction: column; }
    .fill-width { flex: 1; }
    .stat-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-family: var(--font-heading); font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin-top: 2px; }

    .text-emerald { color: #34d399; }
    .text-amber { color: #fbbf24; }

    .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .stat-percent { font-family: var(--font-heading); font-weight: 700; color: #c084fc; font-size: 1.1rem; }
    .progress-bar-bg { width: 100%; height: 8px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #8b5cf6, #ec4899); border-radius: 4px; transition: width 0.4s ease; }
  `]
})
export class TaskStatsComponent {
  taskService = inject(TaskService);
}
