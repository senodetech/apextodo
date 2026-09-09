import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIcon(type: ToastMessage['type']): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '⚠️';
      case 'warning': return '⚡';
      default: return 'ℹ️';
    }
  }

  onDismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
