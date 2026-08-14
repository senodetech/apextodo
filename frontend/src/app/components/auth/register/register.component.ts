import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <!-- Logo & Branding -->
        <div class="brand-header">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1>ApexTodo</h1>
          <p class="subtitle">Join the Enterprise Task Workspace</p>
        </div>

        <!-- Register Card -->
        <div class="auth-card glass-card">
          <div class="card-header">
            <h2>Create Your Account</h2>
            <p>Get started with fast, synchronized task management</p>
          </div>

          <!-- Super Admin First User Banner -->
          <div class="super-admin-banner">
            <div class="crown-icon">👑</div>
            <div class="banner-text">
              <strong>Super Admin Rule Active</strong>
              <span>The first registered account automatically receives full <b>Super Admin</b> privileges.</span>
            </div>
          </div>

          <!-- Error Alert -->
          <div *ngIf="authService.error() || localError" class="alert-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ localError || authService.error() }}</span>
          </div>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <!-- Name -->
            <div class="form-group">
              <label class="form-label" for="reg-name">Full Name</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="reg-name"
                  type="text"
                  class="form-input with-icon"
                  placeholder="Alex Mercer"
                  [(ngModel)]="name"
                  name="name"
                  required
                  autofocus
                />
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label" for="reg-email">Work Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="reg-email"
                  type="email"
                  class="form-input with-icon"
                  placeholder="alex@company.com"
                  [(ngModel)]="email"
                  name="email"
                  required
                />
              </div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label" for="reg-password">Password (min 6 chars)</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="reg-password"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-input with-icon"
                  placeholder="••••••••"
                  [(ngModel)]="password"
                  name="password"
                  required
                />
                <button
                  type="button"
                  class="btn-toggle-pw"
                  (click)="showPassword = !showPassword"
                  tabindex="-1"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
              <label class="form-label" for="reg-confirm">Confirm Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <input
                  id="reg-confirm"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-input with-icon"
                  placeholder="••••••••"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                />
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="!name.trim() || !email.trim() || !password || authService.loading()"
            >
              <div *ngIf="authService.loading()" class="spinner-sm"></div>
              <span>{{ authService.loading() ? 'Creating account...' : 'Complete Registration' }}</span>
            </button>
          </form>

          <!-- Footer Switcher -->
          <div class="card-footer">
            <p>
              Already have an account?
              <a routerLink="/login" class="link-highlight">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: radial-gradient(circle at top center, rgba(168, 85, 247, 0.15), transparent 70%),
                  radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.1), transparent 60%);
    }
    .auth-container {
      width: 100%;
      max-width: 460px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .brand-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      margin-bottom: 12px;
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }
    .brand-header h1 {
      font-family: var(--font-heading);
      font-size: 1.85rem;
      font-weight: 800;
      color: #fff;
      margin: 0;
    }
    .subtitle {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .auth-card {
      width: 100%;
      padding: 32px;
      border: 1px solid var(--border-subtle);
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
    }
    .card-header {
      margin-bottom: 20px;
      text-align: center;
    }
    .card-header h2 {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 6px 0;
    }
    .card-header p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0;
    }
    .super-admin-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.1));
      border: 1px solid rgba(168, 85, 247, 0.35);
      padding: 12px 16px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
    }
    .crown-icon {
      font-size: 1.4rem;
    }
    .banner-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.8rem;
      color: #e2e8f0;
    }
    .banner-text strong {
      color: #c084fc;
    }
    .alert-error {
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.35);
      color: #fda4af;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 14px;
      color: var(--text-muted);
      pointer-events: none;
    }
    .form-input.with-icon {
      padding-left: 42px;
    }
    .btn-toggle-pw {
      position: absolute;
      right: 12px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 6px;
    }
    .btn-toggle-pw:hover {
      color: var(--text-primary);
    }
    .btn-block {
      width: 100%;
      padding: 13px;
      font-size: 0.95rem;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .spinner-sm {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .card-footer {
      margin-top: 22px;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-subtle);
      padding-top: 16px;
    }
    .link-highlight {
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 600;
      margin-left: 4px;
    }
    .link-highlight:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  localError: string | null = null;

  onSubmit() {
    this.localError = null;

    if (this.password.length < 6) {
      this.localError = 'Password must be at least 6 characters long.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.localError = 'Passwords do not match.';
      return;
    }

    this.authService
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
      });
  }
}
