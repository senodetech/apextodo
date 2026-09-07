import { Component, OnInit, AfterViewInit, inject, NgZone, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, AfterViewInit {
  authService = inject(AuthService);
  router = inject(Router);
  private ngZone = inject(NgZone);

  @ViewChild('googleBtn') googleBtnRef!: ElementRef;

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  localError: string | null = null;

  ngOnInit() {}

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
          text: 'signup_with',
          logo_alignment: 'left',
          width: 376,
        });
      }
    } else {
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

