import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration: number;
  isExiting?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string, duration = 4500): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
      isExiting: false,
    };

    this.toasts.update((current) => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, title?: string, duration = 4500): void {
    this.show(message, 'success', title, duration);
  }

  error(message: string, title?: string, duration = 5500): void {
    this.show(message, 'error', title, duration);
  }

  warning(message: string, title?: string, duration = 4500): void {
    this.show(message, 'warning', title, duration);
  }

  info(message: string, title?: string, duration = 4500): void {
    this.show(message, 'info', title, duration);
  }

  dismiss(id: string): void {
    // Set exiting flag to trigger left slide-out animation
    this.toasts.update((list) =>
      list.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    // Remove from array after animation finishes
    setTimeout(() => {
      this.toasts.update((list) => list.filter((t) => t.id !== id));
    }, 380);
  }
}
