import { Component, OnInit, AfterViewInit, inject, NgZone, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginInput } from '../../../models/user.model';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  authService = inject(AuthService);
  router = inject(Router);
  private ngZone = inject(NgZone);

  @ViewChild('googleBtn') googleBtnRef!: ElementRef;

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

  ngAfterViewInit() {
    this.initGoogleAuth();
  }

  private initGoogleAuth() {
    if (typeof window !== 'undefined' && typeof google !== 'undefined' && google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCallback(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (this.googleBtnRef?.nativeElement) {
        google.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 376,
        });
      }
    } else {
      // Retry in 500ms if GIS script is still loading
      setTimeout(() => this.initGoogleAuth(), 500);
    }
  }

  handleGoogleCallback(response: any) {
    if (response?.credential) {
      this.ngZone.run(() => {
        this.authService.loginWithGoogle(response.credential).subscribe({
          next: () => this.router.navigate(['/dashboard']),
        });
      });
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

