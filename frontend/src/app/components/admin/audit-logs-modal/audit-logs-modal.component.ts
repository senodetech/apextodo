import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserAdminService } from '../../../services/user-admin.service';
import { AuthLog } from '../../../models/user.model';

@Component({
  selector: 'app-audit-logs-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-card glass-card logs-modal">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-title">
            <div class="icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <h2>Security & Authentication Logs</h2>
              <p>Real-time database audit trail for authentication events</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-sm btn-action" (click)="loadLogs()" title="Refresh logs">
              ↺ Refresh
            </button>
            <button class="btn-icon" (click)="closeModal.emit()" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div *ngIf="loading" class="loading-box">
          <div class="spinner"></div>
          <p>Fetching audit logs...</p>
        </div>

        <div *ngIf="!loading && logs.length === 0" class="empty-logs">
          <p>No audit logs found.</p>
        </div>

        <div *ngIf="!loading && logs.length > 0" class="table-responsive">
          <table class="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User Email</th>
                <th>Status</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs">
                <td class="date-cell">
                  {{ log.createdAt | date:'MMM d, h:mm:ss a' }}
                </td>
                <td>
                  <span class="action-tag">{{ formatAction(log.action) }}</span>
                </td>
                <td class="email-cell">{{ log.userEmail }}</td>
                <td>
                  <span class="status-badge" [class.status-success]="log.status === 'SUCCESS'" [class.status-fail]="log.status === 'FAILURE'">
                    {{ log.status }}
                  </span>
                </td>
                <td class="ip-cell">{{ log.ipAddress || '127.0.0.1' }}</td>
                <td class="details-cell">{{ log.details || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .logs-modal {
      max-width: 960px;
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
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
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
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-subtle);
      color: #e2e8f0;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
    }
    .table-responsive {
      max-height: 440px;
      overflow-y: auto;
    }
    .logs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }
    .logs-table th {
      text-align: left;
      padding: 10px 12px;
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .logs-table td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-secondary);
    }
    .action-tag {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.72rem;
    }
    .status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .status-success {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }
    .status-fail {
      background: rgba(244, 63, 94, 0.2);
      color: #fb7185;
    }
    .date-cell, .ip-cell {
      white-space: nowrap;
      font-family: monospace;
      font-size: 0.78rem;
    }
    .email-cell {
      color: #fff;
      font-weight: 500;
    }
    .details-cell {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-muted);
    }
    .loading-box, .empty-logs {
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
    }
  `]
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
