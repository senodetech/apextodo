import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';

@Component({
  selector: 'app-notifications-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notifications-modal.component.html',
  styleUrl: './notifications-modal.component.css'
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
