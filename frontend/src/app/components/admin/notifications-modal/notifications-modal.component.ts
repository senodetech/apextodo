import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';

@Component({
  selector: 'app-notifications-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-card glass-modal animate-slide-down">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-title">
            <div class="icon-bubble">🔔</div>
            <div>
              <h3>Super Admin Alert Center</h3>
              <p class="subtitle">Real-time alerts when Admins manage team members</p>
            </div>
          </div>
          <div class="header-actions">
            <button
              *ngIf="notificationService.unreadCount() > 0"
              class="btn-text-action"
              (click)="notificationService.markAllAsRead()"
            >
              Mark all as read
            </button>
            <button class="btn-close" (click)="closeModal.emit()" aria-label="Close">✕</button>
          </div>
        </div>

        <!-- Notification List Body -->
        <div class="modal-body">
          <div *ngIf="notificationService.loading()" class="loading-state">
            <div class="spinner"></div>
            <span>Loading alerts...</span>
          </div>

          <div
            *ngIf="!notificationService.loading() && notificationService.notifications().length === 0"
            class="empty-state"
          >
            <span class="empty-icon">🔕</span>
            <h4>No activity alerts</h4>
            <p>You will be notified whenever an Admin creates, updates, or removes a member.</p>
          </div>

          <div *ngIf="!notificationService.loading()" class="notification-list">
            <div
              *ngFor="let item of notificationService.notifications()"
              class="notification-item glass-item"
              [class.unread]="!item.isRead"
              (click)="onItemClick(item)"
            >
              <div class="item-icon-wrapper" [ngSwitch]="item.type">
                <span *ngSwitchCase="'MEMBER_CREATED'" class="type-icon created">👤+</span>
                <span *ngSwitchCase="'MEMBER_DELETED'" class="type-icon deleted">🗑️</span>
                <span *ngSwitchCase="'MEMBER_UPDATED'" class="type-icon updated">✏️</span>
                <span *ngSwitchDefault class="type-icon default">ℹ️</span>
              </div>

              <div class="item-content">
                <div class="item-top">
                  <span class="item-title">{{ item.title }}</span>
                  <span class="item-time">{{ item.createdAt | date:'short' }}</span>
                </div>
                <p class="item-message">{{ item.message }}</p>
                <div class="item-meta">
                  <span class="meta-actor">Actor: <strong>{{ item.actorEmail }}</strong></span>
                  <span *ngIf="item.targetEmail" class="meta-target">Target: {{ item.targetEmail }}</span>
                </div>
              </div>

              <div *ngIf="!item.isRead" class="unread-dot" title="Unread alert"></div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <span class="footer-info">Showing {{ notificationService.notifications().length }} recent alerts</span>
          <button class="btn-done" (click)="closeModal.emit()">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(10, 15, 30, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1200;
      padding: 20px;
    }
    .modal-card {
      width: 100%;
      max-width: 600px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      background: #131b2e;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .icon-bubble {
      font-size: 24px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-title h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #f1f5f9;
    }
    .subtitle {
      margin: 2px 0 0;
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-text-action {
      background: none;
      border: none;
      color: #60a5fa;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .btn-text-action:hover {
      background: rgba(96, 165, 250, 0.1);
    }
    .btn-close {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-close:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }
    .modal-body {
      padding: 16px 20px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .notification-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .notification-item {
      display: flex;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }
    .notification-item:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-1px);
    }
    .notification-item.unread {
      background: rgba(59, 130, 246, 0.08);
      border-color: rgba(59, 130, 246, 0.25);
    }
    .item-icon-wrapper {
      padding-top: 2px;
    }
    .type-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
    }
    .type-icon.created {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .type-icon.deleted {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .type-icon.updated {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .type-icon.default {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
    }
    .item-content {
      flex: 1;
    }
    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .item-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #f8fafc;
    }
    .item-time {
      font-size: 0.75rem;
      color: #64748b;
    }
    .item-message {
      margin: 0 0 6px;
      font-size: 0.84rem;
      color: #cbd5e1;
      line-height: 1.4;
    }
    .item-meta {
      display: flex;
      gap: 12px;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3b82f6;
      position: absolute;
      top: 14px;
      right: 14px;
      box-shadow: 0 0 8px #3b82f6;
    }
    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: #64748b;
    }
    .empty-icon {
      font-size: 36px;
      display: block;
      margin-bottom: 10px;
    }
    .empty-state h4 {
      margin: 0 0 6px;
      color: #94a3b8;
      font-size: 1rem;
    }
    .empty-state p {
      margin: 0;
      font-size: 0.82rem;
    }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
    }
    .footer-info {
      font-size: 0.78rem;
      color: #64748b;
    }
    .btn-done {
      background: #3b82f6;
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-done:hover {
      background: #2563eb;
    }
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 40px;
      color: #94a3b8;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class NotificationsModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  notificationService = inject(NotificationService);

  ngOnInit() {
    this.notificationService.loadNotifications();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal.emit();
    }
  }

  onItemClick(item: Notification) {
    if (!item.isRead) {
      this.notificationService.markAsRead(item.id);
    }
  }
}
