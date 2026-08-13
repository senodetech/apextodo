import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-google-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="closeModal.emit()">
      <div class="modal-card glass-card" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="google-badge-header">
            <svg width="28" height="28" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span class="header-title">Sign in with Google</span>
          </div>
          <button class="btn-icon" (click)="closeModal.emit()" title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="auth-prompt">To continue to <strong>ApexTasks Workspace</strong>, sign in with your Google account.</p>

          <form (ngSubmit)="onConfirmLogin()">
            <div class="form-group">
              <label class="form-label">Enter Google Account Email</label>
              <input
                type="email"
                class="form-input"
                placeholder="name&#64;gmail.com"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
              />
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                Type any Google or Gmail address to authenticate your workspace.
              </span>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal.emit()">Cancel</button>
              <button type="submit" class="btn btn-google-submit">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-card {
      width: 100%;
      max-width: 440px;
      padding: 24px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid var(--border-glow);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .google-badge-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-title {
      font-family: var(--font-heading);
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
    }
    .auth-prompt {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .auth-prompt strong {
      color: #fff;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .btn-google-submit {
      background: linear-gradient(135deg, #4285f4, #34a853);
      color: #fff;
      font-weight: 600;
      border: none;
      padding: 10px 18px;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 15px rgba(66, 133, 244, 0.4);
      transition: all 0.25s ease;
    }
    .btn-google-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(66, 133, 244, 0.6);
    }
  `]
})
export class GoogleAuthModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  authService = inject(AuthService);

  email = 'senapathybglore@gmail.com';

  async onConfirmLogin() {
    if (this.email.trim()) {
      await this.authService.loginWithGoogle(this.email.trim());
      this.closeModal.emit();
    }
  }
}
