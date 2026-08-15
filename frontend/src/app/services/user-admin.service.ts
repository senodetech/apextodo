import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole, CreateUserInput, AuthLog } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  private http = inject(HttpClient);
  private readonly USERS_URL = `${environment.apiUrl}/users`;
  private readonly AUTH_URL = `${environment.apiUrl}/auth`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.USERS_URL);
  }

  getAssignableUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.USERS_URL}/assignable`);
  }

  createUser(input: CreateUserInput): Observable<User> {
    return this.http.post<User>(this.USERS_URL, input);
  }

  updateUserRole(userId: string, role: UserRole): Observable<User> {
    return this.http.patch<User>(`${this.USERS_URL}/${userId}/role`, { role });
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.USERS_URL}/${userId}`);
  }

  getAuditLogs(limit = 100): Observable<AuthLog[]> {
    return this.http.get<AuthLog[]>(`${this.AUTH_URL}/audit-logs?limit=${limit}`);
  }
}
