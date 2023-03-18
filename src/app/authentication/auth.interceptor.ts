import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastMessageService } from '../services/toast-message/toast-message.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private toastMessage: ToastMessageService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    if (this.authService.isLoggedIn) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.authService.getToken()
        }
      })
    }
    // return next.handle(request);
    return next.handle(request).pipe( tap(() => {},
      (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status !== 401) {
          return;
        }
        this.toastMessage.error("", "Your session has expired! Please login again")
        this.authService.doLogout();
      }
    }));
  }
}
