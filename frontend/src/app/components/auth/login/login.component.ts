import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginInput } from '../../../models/user.model';
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

  private readonly REMEMBER_ME_KEY = 'apex_remember_me_email';

  showPassword = false;
  rememberMe = false;

  formData: LoginInput = {
    email: '',
    password: '',
  };

  ngOnInit() {
    const savedEmail = localStorage.getItem(this.REMEMBER_ME_KEY);
    if (savedEmail) {
      this.formData.email = savedEmail;
      this.rememberMe = true;
    }
  }

  onSubmit() {
    if (!this.formData.email.trim() || !this.formData.password) return;

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
