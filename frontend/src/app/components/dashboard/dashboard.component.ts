import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { MemberDashboardComponent } from './member-dashboard/member-dashboard.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { UserManagementModalComponent } from '../admin/user-management-modal/user-management-modal.component';
import { AuditLogsModalComponent } from '../admin/audit-logs-modal/audit-logs-modal.component';
import { NotificationsModalComponent } from '../admin/notifications-modal/notifications-modal.component';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    AdminDashboardComponent,
    MemberDashboardComponent,
    TaskFormComponent,
    UserManagementModalComponent,
    AuditLogsModalComponent,
    NotificationsModalComponent,
  ],
  template: `
    <div class="app-layout">
      <!-- Header Bar -->
      <app-header
        (openCreateModal)="openCreateModal()"
        (openUserManagementModal)="showUserModal = true"
        (openAuditLogsModal)="showLogsModal = true"
        (openNotificationsModal)="showNotificationsModal = true"
      ></app-header>

      <!-- Main Dashboard Content: Dynamic Switcher between Executive Admin and Member View -->
      <main class="main-content">
        <!-- Executive Admin Dashboard (when user is Admin and in 'admin' mode) -->
        <ng-container *ngIf="authService.isAdmin() && taskService.dashboardMode() === 'admin'">
          <app-admin-dashboard
            (openCreateModal)="openCreateModal()"
            (openEditModal)="openEditModal($event)"
          ></app-admin-dashboard>
        </ng-container>

        <!-- Member Personal Dashboard (for standard users or Admin in 'personal' workspace mode) -->
        <ng-container *ngIf="!authService.isAdmin() || taskService.dashboardMode() === 'personal'">
          <app-member-dashboard
            (openCreateModal)="openCreateModal()"
            (openEditModal)="openEditModal($event)"
          ></app-member-dashboard>
        </ng-container>
      </main>

      <!-- Task Form Modal -->
      <app-task-form
        *ngIf="showModal"
        [editingTask]="editingTask"
        (closeModal)="closeModal()"
      ></app-task-form>

      <!-- Admin: User Management Modal -->
      <app-user-management-modal
        *ngIf="showUserModal"
        (closeModal)="showUserModal = false"
      ></app-user-management-modal>

      <!-- Admin: Audit Logs Modal -->
      <app-audit-logs-modal
        *ngIf="showLogsModal"
        (closeModal)="showLogsModal = false"
      ></app-audit-logs-modal>

      <!-- Super Admin: Activity Alerts Modal -->
      <app-notifications-modal
        *ngIf="showNotificationsModal"
        (closeModal)="showNotificationsModal = false"
      ></app-notifications-modal>
    </div>
  `,
  styles: [`
    .app-layout {
      max-width: 1240px;
      margin: 0 auto;
      padding: 32px 20px;
      min-height: 100vh;
    }
    .main-content {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class DashboardComponent implements OnInit {
  taskService = inject(TaskService);
  authService = inject(AuthService);

  showModal = false;
  showUserModal = false;
  showLogsModal = false;
  showNotificationsModal = false;
  editingTask: Task | null = null;

  ngOnInit() {
    this.taskService.loadTasks();
    this.taskService.loadStats();
  }

  openCreateModal() {
    this.editingTask = null;
    this.showModal = true;
  }

  openEditModal(task: Task) {
    this.editingTask = task;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingTask = null;
  }
}
