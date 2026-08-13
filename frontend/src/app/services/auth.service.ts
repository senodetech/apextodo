import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem('apex_auth_token'));
  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());

  constructor() {
    if (this.token() && !this.currentUser()) {
      this.fetchProfile();
    }
  }

  async loginWithGoogle(email = 'senapathybglore@gmail.com'): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
        email,
        provider: 'google',
      })
    );
    this.setSession(res.accessToken, res.user);
    return res.user;
  }

  async loginAsUser(email: string, displayName?: string): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
        email,
        displayName,
        provider: 'google',
      })
    );
    this.setSession(res.accessToken, res.user);
    return res.user;
  }

  async getAvailableAccounts(): Promise<User[]> {
    return firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/users`));
  }

  async fetchProfile(): Promise<User | null> {
    try {
      const user = await firstValueFrom(this.http.get<User>(`${this.apiUrl}/me`));
      this.currentUser.set(user);
      localStorage.setItem('apex_auth_user', JSON.stringify(user));
      return user;
    } catch {
      this.logout();
      return null;
    }
  }

  setSession(token: string, user: User) {
    this.token.set(token);
    this.currentUser.set(user);
    localStorage.setItem('apex_auth_token', token);
    localStorage.setItem('apex_auth_user', JSON.stringify(user));
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('apex_auth_token');
    localStorage.removeItem('apex_auth_user');
  }

  private getStoredUser(): User | null {
    const data = localStorage.getItem('apex_auth_user');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
