import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginInput, UserRole } from '../../../models/user.model';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  UserRole = UserRole;

  private readonly REMEMBER_ME_KEY = 'apex_remember_me_email';

  showPassword = false;
  rememberMe = false;

  formData: LoginInput = {
    email: '',
    password: '',
  };

  emailError: string | null = null;
  passwordError: string | null = null;

  ngOnInit() {
    const savedEmail = localStorage.getItem(this.REMEMBER_ME_KEY);
    if (savedEmail) {
      this.formData.email = savedEmail;
      this.rememberMe = true;
    }
  }

  onEmailInput() {
    if (this.emailError) {
      this.validateEmail();
    }
  }

  onPasswordInput() {
    if (this.passwordError) {
      this.validatePassword();
    }
  }

  private validateEmail(): boolean {
    const email = this.formData.email.trim();
    if (!email) {
      this.emailError = 'Email address is required.';
      return false;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      this.emailError = 'Please enter a valid email address (e.g., name@company.com).';
      return false;
    }
    this.emailError = null;
    return true;
  }

  private validatePassword(): boolean {
    if (!this.formData.password) {
      this.passwordError = 'Password is required.';
      return false;
    }
    this.passwordError = null;
    return true;
  }

  quickDemoLogin(role: UserRole) {
    this.emailError = null;
    this.passwordError = null;
    this.authService.demoLogin(role).subscribe({
      next: () => this.router.navigate(['/dashboard']),
    });
  }

  onSubmit() {
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    if (this.rememberMe) {
      localStorage.setItem(this.REMEMBER_ME_KEY, this.formData.email.trim());
    } else {
      localStorage.removeItem(this.REMEMBER_ME_KEY);
    }

    this.authService.login(this.formData).subscribe({
      next: () => this.router.navigate(['/dashboard']),
    });
  }
}

