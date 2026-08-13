import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { TaskStatsComponent } from './components/task-stats/task-stats.component';
import { TaskToolbarComponent } from './components/task-toolbar/task-toolbar.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { GoogleAuthModalComponent } from './components/google-auth-modal/google-auth-modal.component';
import { Task } from './models/task.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    TaskStatsComponent,
    TaskToolbarComponent,
    TaskListComponent,
    KanbanBoardComponent,
    TaskFormComponent,
    GoogleAuthModalComponent,
  ],
  template: `
    <div class="app-layout">
      <!-- Header Bar -->
      <app-header
        (openCreateModal)="openCreateModal()"
        (openGoogleAuthModal)="showAuthModal = true"
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

      <!-- Google OAuth Sign In Modal -->
      <app-google-auth-modal
        *ngIf="showAuthModal"
        (closeModal)="showAuthModal = false"
      ></app-google-auth-modal>
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
export class AppComponent {
  currentView: 'list' | 'kanban' = 'list';
  showModal = false;
  showAuthModal = false;
  editingTask: Task | null = null;

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
