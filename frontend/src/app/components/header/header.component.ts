import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

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
          <p class="subtitle">OAuth2 & NestJS Guards Multi-Tenant Workspace</p>
        </div>
      </div>

      <div class="header-right">
        <!-- Date Badge -->
        <div class="date-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{{ today | date:'EEEE, MMM d, y' }}</span>
        </div>

        <!-- Auth Section -->
        <ng-container *ngIf="authService.currentUser(); else loginBtnTemplate">
          <!-- Active User Badge & Account Switcher -->
          <div class="user-profile-badge">
            <img [src]="authService.currentUser()?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=senapathy'" alt="Avatar" class="user-avatar" />
            <div class="user-details">
              <span class="user-name">{{ authService.currentUser()?.displayName }}</span>
              <span class="user-email">{{ authService.currentUser()?.email }}</span>
            </div>
            
            <!-- Quick Account Switcher Dropdown -->
            <select class="account-switcher" (change)="switchAccount($event)" [value]="authService.currentUser()?.email">
              <option value="senapathybglore@gmail.com">👤 Senapathy (senapathybglore&#64;gmail.com)</option>
              <option value="senodetech@gmail.com">👤 SenoTech (senodetech&#64;gmail.com)</option>
              <option value="alex.techlead@apextasks.dev">🛠️ Alex TechLead (alex.techlead&#64;apextasks.dev)</option>
            </select>
          </div>

          <button class="btn btn-secondary btn-logout" (click)="authService.logout()" title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
        </ng-container>

        <ng-template #loginBtnTemplate>
          <button class="btn btn-google" (click)="loginWithGoogle()">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        </ng-template>

        <!-- New Task Trigger -->
        <button class="btn btn-primary" (click)="openCreateModal.emit()" [disabled]="!authService.isAuthenticated()">
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
      flex-wrap: wrap;
      gap: 16px;
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
      gap: 14px;
      flex-wrap: wrap;
    }
    .date-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #1e293b;
      border: 1px solid var(--accent-primary);
    }
    .user-details {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .user-email {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .account-switcher {
      background: rgba(30, 41, 59, 0.8);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.78rem;
      cursor: pointer;
      outline: none;
    }
    .account-switcher option {
      background: #0f172a;
      color: #fff;
    }
    .btn-google {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      gap: 10px;
    }
    .btn-google:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.3);
    }
    .btn-logout {
      padding: 8px 14px;
      font-size: 0.82rem;
    }
    @media (max-width: 768px) {
      .app-header { flex-direction: column; align-items: flex-start; }
      .header-right { width: 100%; justify-content: space-between; }
      .user-details { display: none; }
    }
  `]
})
export class HeaderComponent {
  @Output() openCreateModal = new EventEmitter<void>();
  today = new Date();
  taskService = inject(TaskService);
  authService = inject(AuthService);

  loginWithGoogle() {
    this.authService.loginWithGoogle('senapathybglore@gmail.com');
  }

  switchAccount(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value) {
      this.authService.loginAsUser(select.value);
    }
  }
}
