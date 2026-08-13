import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div style="display:flex; justify-content:center; align-items:center; height:100vh; color:#fff;">
      <div style="text-align:center;">
        <h2>Authenticating via OAuth2...</h2>
        <p>Finalizing JWT token session and redirecting to your workspace.</p>
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.setSession(token, {
        id: '',
        email: 'senapathybglore@gmail.com',
        displayName: 'Senapathy (Google OAuth)',
        provider: 'google',
      });
      await this.authService.fetchProfile();
    }
    this.router.navigate(['/']);
  }
}
