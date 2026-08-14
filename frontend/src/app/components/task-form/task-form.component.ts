import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { UserAdminService } from '../../services/user-admin.service';
import { Task, TaskPriority, CreateTaskInput } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-card glass-card">
        <div class="modal-header">
          <h2>{{ editingTask ? 'Edit & Reassign Task' : 'Create / Assign New Task' }}</h2>
          <button class="btn-icon" (click)="closeModal.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="form-body">
          <!-- Title -->
          <div class="form-group">
            <label class="form-label">Task Title *</label>
            <input
              type="text"
              class="form-input"
              placeholder="e.g. Design Landing Page Wireframe"
              [(ngModel)]="formData.title"
              name="title"
              required
              autofocus
            />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Description (Optional)</label>
            <textarea
              class="form-textarea"
              rows="3"
              placeholder="Add key details, links, or acceptance criteria..."
              [(ngModel)]="formData.description"
              name="description"
            ></textarea>
          </div>

          <!-- Grid: Priority & Category -->
          <div class="form-row">
            <div class="form-group half-width">
              <label class="form-label">Priority</label>
              <select
                class="form-select"
                [(ngModel)]="formData.priority"
                name="priority"
              >
                <option [value]="PriorityEnum.LOW">🟢 Low</option>
                <option [value]="PriorityEnum.MEDIUM">🟡 Medium</option>
                <option [value]="PriorityEnum.HIGH">🔴 High</option>
                <option [value]="PriorityEnum.URGENT">🟣 Urgent</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label class="form-label">Category</label>
              <input
                type="text"
                class="form-input"
                placeholder="e.g. Work, Personal, Feature"
                [(ngModel)]="formData.category"
                name="category"
              />
            </div>
          </div>

          <!-- Assign To User (Only visible to Admin & Super Admin) -->
          <div class="form-group" *ngIf="authService.isAdmin()">
            <label class="form-label">👤 Assign Task To</label>
            <select
              class="form-select"
              [(ngModel)]="formData.assignedToId"
              name="assignedToId"
            >
              <option value="">-- Unassigned (Self) --</option>
              <option *ngFor="let u of assignableUsers" [value]="u.id">
                {{ u.name }} ({{ u.role === 'SUPER_ADMIN' ? '👑 Super Admin' : (u.role === 'ADMIN' ? '🛡️ Admin' : 'Member') }})
              </option>
            </select>
          </div>

          <!-- Due Date -->
          <div class="form-group">
            <label class="form-label">Due Date & Time</label>
            <input
              type="datetime-local"
              class="form-input"
              [(ngModel)]="formData.dueDate"
              name="dueDate"
            />
          </div>

          <!-- Buttons -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal.emit()">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!formData.title.trim() || submitting"
            >
              {{ submitting ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-card {
      width: 100%;
      max-width: 520px;
      padding: 28px;
      background: #111827;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .modal-header h2 {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .form-body {
      display: flex;
      flex-direction: column;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .half-width {
      flex: 1;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }
  `]
})
export class TaskFormComponent implements OnInit {
  @Input() editingTask: Task | null = null;
  @Output() closeModal = new EventEmitter<void>();

  taskService = inject(TaskService);
  authService = inject(AuthService);
  userAdminService = inject(UserAdminService);

  PriorityEnum = TaskPriority;
  submitting = false;
  assignableUsers: User[] = [];

  formData: CreateTaskInput = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    category: 'General',
    dueDate: '',
    assignedToId: '',
  };

  ngOnInit() {
    if (this.authService.isAdmin()) {
      this.userAdminService.getAssignableUsers().subscribe({
        next: (users) => (this.assignableUsers = users),
      });
    }

    if (this.editingTask) {
      this.formData = {
        title: this.editingTask.title,
        description: this.editingTask.description || '',
        priority: this.editingTask.priority,
        category: this.editingTask.category || 'General',
        assignedToId: this.editingTask.assignedToId || '',
        dueDate: this.editingTask.dueDate
          ? new Date(this.editingTask.dueDate).toISOString().slice(0, 16)
          : '',
      };
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal.emit();
    }
  }

  onSubmit() {
    if (!this.formData.title.trim()) return;

    this.submitting = true;

    const payload = {
      ...this.formData,
      assignedToId: this.formData.assignedToId || undefined,
    };

    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, payload).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal.emit();
        },
        error: () => (this.submitting = false),
      });
    } else {
      this.taskService.createTask(payload).subscribe({
        next: () => {
          this.submitting = false;
          this.closeModal.emit();
        },
        error: () => (this.submitting = false),
      });
    }
  }
}
