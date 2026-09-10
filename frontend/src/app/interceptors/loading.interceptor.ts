import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Allow silent background pings without popping the loader
  const isSilent = req.headers.has('x-silent-ping');
  if (isSilent) {
    const cleanReq = req.clone({
      headers: req.headers.delete('x-silent-ping'),
    });
    return next(cleanReq);
  }

  // Customize message based on route
  let customMessage = 'Processing request...';
  if (req.url.includes('/auth/login') || req.url.includes('/auth/demo-login')) {
    customMessage = 'Signing in to workspace...';
  } else if (req.url.includes('/auth/register')) {
    customMessage = 'Creating your account...';
  } else if (req.url.includes('/tasks') && req.method === 'POST') {
    customMessage = 'Creating task item...';
  } else if (req.url.includes('/tasks') && (req.method === 'PATCH' || req.method === 'PUT')) {
    customMessage = 'Updating task...';
  }

  loadingService.show(customMessage);

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};
