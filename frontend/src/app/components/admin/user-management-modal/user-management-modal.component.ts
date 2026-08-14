import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserAdminService } from '../../../services/user-admin.service';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole, CreateUserInput } from '../../../models/user.model';

@Component({
  selector: 'app-user-management-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-card glass-card admin-modal">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-title">
            <div class="icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h2>Team & User Management</h2>
              <p>Manage system users, roles, and administrative access</p>
            </div>
          </div>
          <button class="btn-icon" (click)="closeModal.emit()" title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="admin-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab === 'list'"
            (click)="activeTab = 'list'"
          >
            All Users ({{ users.length }})
          </button>
          <button
            class="tab-btn btn-highlight"
            [class.active]="activeTab === 'create'"
            (click)="activeTab = 'create'"
          >
            + Add New User
          </button>
        </div>

        <!-- Error & Success Banners -->
        <div *ngIf="errorMsg" class="alert alert-error">
          <span>{{ errorMsg }}</span>
        </div>
        <div *ngIf="successMsg" class="alert alert-success">
          <span>{{ successMsg }}</span>
        </div>

        <!-- TAB 1: User List -->
        <div *ngIf="activeTab === 'list'" class="tab-content">
          <div *ngIf="loading" class="loading-box">
            <div class="spinner"></div>
            <p>Loading users...</p>
          </div>

          <div *ngIf="!loading && users.length > 0" class="table-responsive">
            <table class="user-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Tasks</th>
                  <th>Joined Date</th>
                  <th *ngIf="authService.isSuperAdmin()">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>
                    <div class="user-cell">
                      <div class="avatar-initials" [class.avatar-super]="user.role === 'SUPER_ADMIN'">
                        {{ getInitials(user.name) }}
                      </div>
                      <div class="user-details">
                        <span class="user-name">{{ user.name }}</span>
                        <span class="user-email">{{ user.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge" [ngClass]="getRoleClass(user.role)">
                      {{ formatRole(user.role) }}
                    </span>
                  </td>
                  <td>
                    <span class="task-count-pill">{{ user.taskCount || 0 }} tasks</span>
                  </td>
                  <td class="date-cell">
                    {{ user.createdAt | date:'mediumDate' }}
                  </td>
                  <td *ngIf="authService.isSuperAdmin()">
                    <div class="actions-cell">
                      <button
                        *ngIf="user.id !== authService.currentUser()?.id"
                        class="btn-sm btn-action"
                        (click)="toggleRole(user)"
                        [title]="user.role === 'ADMIN' ? 'Demote to Member' : 'Promote to Admin'"
                      >
                        {{ user.role === 'ADMIN' ? 'Demote' : 'Promote' }}
                      </button>
                      <button
                        *ngIf="user.id !== authService.currentUser()?.id"
                        class="btn-icon text-danger"
                        (click)="deleteUser(user)"
                        title="Remove user"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 2: Create User Form -->
        <div *ngIf="activeTab === 'create'" class="tab-content">
          <form (ngSubmit)="onAddUser()" class="create-user-form">
            <div class="form-row">
              <div class="form-group half-width">
                <label class="form-label">Full Name *</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="e.g. Sarah Jenkins"
                  [(ngModel)]="newUser.name"
                  name="name"
                  required
                />
              </div>
              <div class="form-group half-width">
                <label class="form-label">Email Address *</label>
                <input
                  type="email"
                  class="form-input"
                  placeholder="sarah@company.com"
                  [(ngModel)]="newUser.email"
                  name="email"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label class="form-label">Password * (min 6 chars)</label>
                <input
                  type="password"
                  class="form-input"
                  placeholder="••••••••"
                  [(ngModel)]="newUser.password"
                  name="password"
                  required
                />
              </div>
              <div class="form-group half-width">
                <label class="form-label">Assigned Role *</label>
                <select
                  class="form-select"
                  [(ngModel)]="newUser.role"
                  name="role"
                >
                  <option [value]="RoleEnum.USER">Member (Standard User)</option>
                  <option [value]="RoleEnum.ADMIN">Admin (User Manager)</option>
                  <option *ngIf="authService.isSuperAdmin()" [value]="RoleEnum.SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="activeTab = 'list'"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!newUser.name.trim() || !newUser.email.trim() || !newUser.password || submitting"
              >
                {{ submitting ? 'Adding User...' : 'Create & Provision User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-modal {
      max-width: 820px;
      width: 100%;
      background: #0f172a;
      border: 1px solid var(--border-subtle);
      padding: 28px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-title h2 {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .header-title p {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin: 2px 0 0 0;
    }
    .admin-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 20px;
      padding-bottom: 10px;
    }
    .tab-btn {
      padding: 8px 16px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
    }
    .tab-btn:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }
    .tab-btn.active {
      background: var(--accent-primary);
      color: #fff;
    }
    .btn-highlight {
      color: #a5b4fc;
    }
    .alert {
      padding: 10px 16px;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
    .alert-error {
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #fda4af;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }
    .table-responsive {
      max-height: 400px;
      overflow-y: auto;
    }
    .user-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .user-table th {
      text-align: left;
      padding: 10px 14px;
      color: var(--text-muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .user-table td {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-secondary);
    }
    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-initials {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      font-weight: 700;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-super {
      background: linear-gradient(135deg, #a855f7, #6366f1);
      color: #fff;
      border: none;
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-weight: 600;
      color: #fff;
    }
    .user-email {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .role-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
    }
    .badge-super {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.4);
    }
    .badge-admin {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.4);
    }
    .badge-user {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .task-count-pill {
      font-size: 0.8rem;
      background: rgba(255, 255, 255, 0.05);
      padding: 2px 8px;
      border-radius: 10px;
    }
    .actions-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-subtle);
      color: #e2e8f0;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .btn-action:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .create-user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .half-width {
      flex: 1;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }
    .loading-box {
      text-align: center;
      padding: 30px;
    }
  `]
})
export class UserManagementModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  userAdminService = inject(UserAdminService);
  authService = inject(AuthService);
  RoleEnum = UserRole;

  activeTab: 'list' | 'create' = 'list';
  users: User[] = [];
  loading = false;
  submitting = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;

  newUser: CreateUserInput = {
    name: '',
    email: '',
    password: '',
    role: UserRole.USER,
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userAdminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load users.';
        this.loading = false;
      },
    });
  }

  onAddUser() {
    this.errorMsg = null;
    this.successMsg = null;
    this.submitting = true;

    this.userAdminService.createUser(this.newUser).subscribe({
      next: (user) => {
        this.successMsg = `User ${user.name} provisioned successfully.`;
        this.submitting = false;
        this.newUser = { name: '', email: '', password: '', role: UserRole.USER };
        this.loadUsers();
        this.activeTab = 'list';
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'Failed to create user.';
      },
    });
  }

  toggleRole(user: User) {
    const targetRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    this.userAdminService.updateUserRole(user.id, targetRole).subscribe({
      next: () => this.loadUsers(),
      error: (err) => (this.errorMsg = err.error?.message || 'Role update failed'),
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Are you sure you want to remove user "${user.name}"?`)) return;

    this.userAdminService.deleteUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => (this.errorMsg = err.error?.message || 'Delete failed'),
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatRole(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return '👑 Super Admin';
      case UserRole.ADMIN:
        return '🛡️ Admin';
      default:
        return 'Member';
    }
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'badge-super';
      case UserRole.ADMIN:
        return 'badge-admin';
      default:
        return 'badge-user';
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal.emit();
    }
  }
}
