import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';
import { UserRole } from '../../models/user.model';
import { BrandLogoComponent } from '../shared/brand-logo/brand-logo.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, BrandLogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() openCreateModal = new EventEmitter<void>();
  @Output() openUserManagementModal = new EventEmitter<void>();
  @Output() openAuditLogsModal = new EventEmitter<void>();
  @Output() openNotificationsModal = new EventEmitter<void>();

  authService = inject(AuthService);
  taskService = inject(TaskService);
  notificationService = inject(NotificationService);

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
