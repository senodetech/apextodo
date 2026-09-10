import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = signal<number>(0);
  private customMessage = signal<string | null>(null);
  private slowTimer: any = null;

  isLoading = computed(() => this.activeRequests() > 0);
  isSlow = signal<boolean>(false);
  message = computed(() => {
    if (this.isSlow()) {
      return 'Waking up cloud server instance... Almost ready!';
    }
    return this.customMessage() || 'Processing request...';
  });

  show(customMsg?: string): void {
    const current = this.activeRequests();
    this.activeRequests.set(current + 1);
    if (customMsg) {
      this.customMessage.set(customMsg);
    }

    if (!this.slowTimer) {
      this.slowTimer = setTimeout(() => {
        if (this.activeRequests() > 0) {
          this.isSlow.set(true);
        }
      }, 2500);
    }
  }

  hide(): void {
    const current = this.activeRequests();
    const next = Math.max(0, current - 1);
    this.activeRequests.set(next);

    if (next === 0) {
      this.customMessage.set(null);
      this.isSlow.set(false);
      if (this.slowTimer) {
        clearTimeout(this.slowTimer);
        this.slowTimer = null;
      }
    }
  }

  forceReset(): void {
    this.activeRequests.set(0);
    this.customMessage.set(null);
    this.isSlow.set(false);
    if (this.slowTimer) {
      clearTimeout(this.slowTimer);
      this.slowTimer = null;
    }
  }
}
