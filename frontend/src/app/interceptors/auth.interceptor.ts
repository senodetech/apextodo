import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  let authReq = req;

  // Attach Bearer token if present
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Avoid looping if 401 occurs on auth routes
      const isAuthRoute =
        req.url.includes('/api/auth/login') ||
        req.url.includes('/api/auth/register') ||
        req.url.includes('/api/auth/refresh');

      if (error.status === 401 && !isAuthRoute && authService.refreshToken()) {
        return authService.refreshSession().pipe(
          switchMap((newAuth) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAuth.accessToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            authService.clearSession();
            return throwError(() => refreshErr);
          }),
        );
      }

      if (error.status === 401 && !isAuthRoute) {
        authService.clearSession();
      }

      return throwError(() => error);
    }),
  );
};
