import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserAdminService } from '../../../services/user-admin.service';
import { AuthLog } from '../../../models/user.model';

@Component({
  selector: 'app-audit-logs-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './audit-logs-modal.component.html',
  styleUrl: './audit-logs-modal.component.css'
})
export class AuditLogsModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  userAdminService = inject(UserAdminService);

  logs: AuthLog[] = [];
  loading = false;

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.userAdminService.getAuditLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ');
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal.emit();
    }
  }
}
