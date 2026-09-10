import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
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

  nameError: string | null = null;
  emailError: string | null = null;
  passwordError: string | null = null;
  confirmPasswordError: string | null = null;

  onNameInput() {
    if (this.nameError) this.validateName();
  }

  onEmailInput() {
    if (this.emailError) this.validateEmail();
  }

  onPasswordInput() {
    if (this.passwordError) this.validatePassword();
    if (this.confirmPasswordError && this.confirmPassword) this.validateConfirmPassword();
  }

  onConfirmPasswordInput() {
    if (this.confirmPasswordError) this.validateConfirmPassword();
  }

  private validateName(): boolean {
    if (!this.name.trim()) {
      this.nameError = 'Full name is required.';
      return false;
    }
    this.nameError = null;
    return true;
  }

  private validateEmail(): boolean {
    const emailVal = this.email.trim();
    if (!emailVal) {
      this.emailError = 'Email address is required.';
      return false;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailVal)) {
      this.emailError = 'Please enter a valid email address.';
      return false;
    }
    this.emailError = null;
    return true;
  }

  private validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Password is required.';
      return false;
    }
    if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters long.';
      return false;
    }
    this.passwordError = null;
    return true;
  }

  private validateConfirmPassword(): boolean {
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Please confirm your password.';
      return false;
    }
    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match.';
      return false;
    }
    this.confirmPasswordError = null;
    return true;
  }

  onSubmit() {
    this.localError = null;

    const vName = this.validateName();
    const vEmail = this.validateEmail();
    const vPass = this.validatePassword();
    const vConfirm = this.validateConfirmPassword();

    if (!vName || !vEmail || !vPass || !vConfirm) {
      return;
    }

    this.authService
      .register({
        name: this.name.trim(),
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
      });
  }
}
