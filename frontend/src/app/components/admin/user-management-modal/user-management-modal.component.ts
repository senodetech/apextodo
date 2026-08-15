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
  templateUrl: './user-management-modal.component.html',
  styleUrl: './user-management-modal.component.css'
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
      error: () => {
        this.errorMsg = 'Failed to load users.';
        this.loading = false;
      },
    });
  }

  canDelete(user: User): boolean {
    if (user.id === this.authService.currentUser()?.id) return false;
    if (this.authService.isSuperAdmin()) return true;
    if (this.authService.isAdmin() && user.role === UserRole.USER) return true;
    return false;
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
