import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { TaskStatsComponent } from '../task-stats/task-stats.component';
import { TaskToolbarComponent } from '../task-toolbar/task-toolbar.component';
import { TaskListComponent } from '../task-list/task-list.component';
import { KanbanBoardComponent } from '../kanban-board/kanban-board.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { UserManagementModalComponent } from '../admin/user-management-modal/user-management-modal.component';
import { AuditLogsModalComponent } from '../admin/audit-logs-modal/audit-logs-modal.component';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    TaskStatsComponent,
    TaskToolbarComponent,
    TaskListComponent,
    KanbanBoardComponent,
    TaskFormComponent,
    UserManagementModalComponent,
    AuditLogsModalComponent,
  ],
  template: `
    <div class="app-layout">
      <!-- Header Bar -->
      <app-header
        (openCreateModal)="openCreateModal()"
        (openUserManagementModal)="showUserModal = true"
        (openAuditLogsModal)="showLogsModal = true"
      ></app-header>

      <!-- Main Dashboard Content -->
      <main class="main-content">
        <!-- Key Metrics Cards -->
        <app-task-stats></app-task-stats>

        <!-- Search & Filter Toolbar -->
        <app-task-toolbar
          [currentView]="currentView"
          (viewChange)="currentView = $event"
        ></app-task-toolbar>

        <!-- Dynamic View: List vs Kanban -->
        <ng-container [ngSwitch]="currentView">
          <app-task-list
            *ngSwitchCase="'list'"
            (openCreateModal)="openCreateModal()"
            (openEditModal)="openEditModal($event)"
          ></app-task-list>

          <app-kanban-board
            *ngSwitchCase="'kanban'"
            (openEditModal)="openEditModal($event)"
          ></app-kanban-board>
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
    </div>
  `,
  styles: [`
    .app-layout {
      max-width: 1200px;
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

  currentView: 'list' | 'kanban' = 'list';
  showModal = false;
  showUserModal = false;
  showLogsModal = false;
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
