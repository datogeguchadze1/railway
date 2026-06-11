import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const PUBLIC_ENDPOINTS = ['/auth/sign_in', '/auth/sign_up'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.token;
  const isEverrest = req.url.includes('api.everrest.educata.dev');
  const isPublic = PUBLIC_ENDPOINTS.some(e => req.url.includes(e));

  if (token && isEverrest && !isPublic) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isEverrest && !isPublic) {
        authService.clearSession();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
