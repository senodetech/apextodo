import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import {
  User,
  UserRole,
  AuthResponse,
  LoginInput,
  RegisterInput,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly ACCESS_TOKEN_KEY = 'apex_access_token';
  private readonly REFRESH_TOKEN_KEY = 'apex_refresh_token';
  private readonly USER_KEY = 'apex_user_profile';

  // Signals
  currentUser = signal<User | null>(null);
  accessToken = signal<string | null>(localStorage.getItem(this.ACCESS_TOKEN_KEY));
  refreshToken = signal<string | null>(localStorage.getItem(this.REFRESH_TOKEN_KEY));
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computeds
  isAuthenticated = computed(() => !!this.currentUser());
  isSuperAdmin = computed(() => this.currentUser()?.role === UserRole.SUPER_ADMIN);
  isAdmin = computed(
    () =>
      this.currentUser()?.role === UserRole.SUPER_ADMIN ||
      this.currentUser()?.role === UserRole.ADMIN,
  );

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    const savedUser = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);

    if (savedUser && token) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
        // Verify with backend silently
        this.fetchProfile().subscribe({
          error: () => this.handleExpiredSession(),
        });
      } catch {
        this.clearSession();
      }
    }
  }

  fetchProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
    );
  }

  register(input: RegisterInput): Observable<AuthResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(`${this.API_URL}/register`, input).pipe(
      tap((res) => {
        this.handleAuthSuccess(res);
        this.loading.set(false);
      }),
      catchError((err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Registration failed. Please try again.';
        this.error.set(Array.isArray(msg) ? msg.join(', ') : msg);
        return throwError(() => err);
      }),
    );
  }

  login(input: LoginInput): Observable<AuthResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(`${this.API_URL}/login`, input).pipe(
      tap((res) => {
        this.handleAuthSuccess(res);
        this.loading.set(false);
      }),
      catchError((err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Invalid email or password.';
        this.error.set(Array.isArray(msg) ? msg.join(', ') : msg);
        return throwError(() => err);
      }),
    );
  }

  refreshSession(): Observable<AuthResponse> {
    const currentRefreshToken = this.refreshToken();
    if (!currentRefreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken: currentRefreshToken })
      .pipe(
        tap((res) => this.handleAuthSuccess(res)),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        }),
      );
  }

  logout() {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  private handleAuthSuccess(res: AuthResponse) {
    this.accessToken.set(res.accessToken);
    this.refreshToken.set(res.refreshToken);
    this.currentUser.set(res.user);

    localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.error.set(null);
  }

  clearSession() {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.currentUser.set(null);

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.router.navigate(['/login']);
  }

  private handleExpiredSession() {
    if (this.refreshToken()) {
      this.refreshSession().subscribe({
        error: () => this.clearSession(),
      });
    } else {
      this.clearSession();
    }
  }
}
