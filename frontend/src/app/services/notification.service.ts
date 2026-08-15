import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../models/notification.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_URL = `${environment.apiUrl}/notifications`;

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);
  loading = signal<boolean>(false);

  constructor() {
    if (this.authService.isSuperAdmin()) {
      this.loadNotifications();
      this.loadUnreadCount();
    }
  }

  loadNotifications(limit = 50) {
    if (!this.authService.isSuperAdmin()) return;

    this.loading.set(true);
    this.http.get<Notification[]>(`${this.API_URL}?limit=${limit}`).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.unreadCount.set(data.filter((n) => !n.isRead).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadUnreadCount() {
    if (!this.authService.isSuperAdmin()) return;

    this.http.get<{ count: number }>(`${this.API_URL}/unread-count`).subscribe({
      next: (res) => this.unreadCount.set(res.count),
    });
  }

  markAsRead(id: string) {
    this.http.patch<Notification>(`${this.API_URL}/${id}/read`, {}).subscribe({
      next: (updated) => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        this.unreadCount.update((count) => Math.max(0, count - 1));
      },
    });
  }

  markAllAsRead() {
    this.http.patch(`${this.API_URL}/read-all`, {}).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => ({ ...n, isRead: true })),
        );
        this.unreadCount.set(0);
      },
    });
  }
}
