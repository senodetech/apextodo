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
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
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
