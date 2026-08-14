import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
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
          <p class="subtitle">Next-Gen Workspace</p>
        </div>
      </div>

      <div class="header-right">
        <!-- Admin Management Trigger -->
        <button
          *ngIf="authService.isAdmin()"
          class="btn-nav"
          (click)="openUserManagementModal.emit()"
          title="Team & User Management"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Team & Users</span>
        </button>

        <!-- Audit Logs Trigger -->
        <button
          *ngIf="authService.isAdmin()"
          class="btn-nav"
          (click)="openAuditLogsModal.emit()"
          title="Security & Auth Logs"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Audit Logs</span>
        </button>

        <!-- New Task Button -->
        <button class="btn btn-primary" (click)="openCreateModal.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>New Task</span>
        </button>

        <!-- User Profile Dropdown / Card -->
        <div class="user-profile-widget">
          <div
            class="user-avatar"
            [class.avatar-super]="authService.isSuperAdmin()"
            [title]="authService.currentUser()?.email || 'User'"
          >
            {{ getInitials(authService.currentUser()?.name) }}
          </div>
          <div class="user-meta">
            <span class="user-display-name">{{ authService.currentUser()?.name }}</span>
            <span class="badge-role" [ngClass]="getRoleClass(authService.currentUser()?.role)">
              {{ formatRole(authService.currentUser()?.role) }}
            </span>
          </div>

          <button class="btn-logout" (click)="authService.logout()" title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 24px;
      margin-bottom: 24px;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-icon {
      width: 42px;
      height: 42px;
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
      font-size: 1.45rem;
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
      font-size: 0.76rem;
      color: var(--text-muted);
      margin: 0;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-nav {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: #cbd5e1;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-nav:hover {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.4);
      color: #fff;
    }
    .user-profile-widget {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px 6px 6px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-subtle);
      border-radius: 30px;
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      font-weight: 700;
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-super {
      background: linear-gradient(135deg, #a855f7, #6366f1);
      color: #fff;
      border: none;
      box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    }
    .user-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .user-display-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #fff;
    }
    .badge-role {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .badge-super { color: #c084fc; }
    .badge-admin { color: #60a5fa; }
    .badge-user { color: #94a3b8; }
    .btn-logout {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      margin-left: 4px;
    }
    .btn-logout:hover {
      color: #fb7185;
      background: rgba(244, 63, 94, 0.15);
    }
    @media (max-width: 860px) {
      .app-header { flex-direction: column; align-items: stretch; gap: 14px; }
      .header-right { flex-wrap: wrap; justify-content: space-between; }
    }
  `]
})
export class HeaderComponent {
  @Output() openCreateModal = new EventEmitter<void>();
  @Output() openUserManagementModal = new EventEmitter<void>();
  @Output() openAuditLogsModal = new EventEmitter<void>();

  authService = inject(AuthService);

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatRole(role?: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return '👑 Super Admin';
      case UserRole.ADMIN:
        return '🛡️ Admin';
      default:
        return 'Member';
    }
  }

  getRoleClass(role?: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'badge-super';
      case UserRole.ADMIN:
        return 'badge-admin';
      default:
        return 'badge-user';
    }
  }
}
