import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../data/data-request.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  endpoint: string = 'https://ulp.uniteframework.io';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly dataService: DataService
  ) { }

  // Sign-up
  signUp(user): Observable<any> {
    const api = `${this.endpoint}/ulp-bff/v1/sso/student/register`;
    return this.http.post(api, user);
  }


  ssoSignUp(user: any) {
    const api = `${this.endpoint}/ulp-bff/v1/sso/digilocker/register`;
    return this.http.post(api, user).pipe(
      map((res: any) => {
        if (res.success && res.user === 'FOUND') {
          if (res.token) {
            localStorage.setItem('accessToken', res.token);
          }

          if (res?.userData?.teacher) {
            localStorage.setItem('currentUser', JSON.stringify(res.userData.teacher));
          }
          return res;
        } else {
          throwError(new Error('Error while register'));
        }
      }))
  }

  // Sign-in
  signIn(user) {
    return this.http
      .post<any>(`${this.endpoint}/ulp-bff/v1/sso/student/login`, user)
      .pipe(tap((res: any) => {
        console.log("res", res);

        if (!res.success) {
          throwError('Incorrect username or password')
        }
      }));
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  get isLoggedIn(): boolean {
    let authToken = localStorage.getItem('accessToken');
    return authToken !== null ? true : false;
  }

  get currentUser(): any {
    let user = localStorage.getItem('currentUser');
    if (user) {
      user = JSON.parse(user);
    }
    return user;
  }

  get schoolDetails(): any {
    let details = localStorage.getItem('schoolDetails');
    if (details) {
      details = JSON.parse(details);
    }
    return details;
  }

  doLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.router.navigate(['']);
  }

  // User profile
  getUserProfile(id: any): Observable<any> {
    let api = `${this.endpoint}/user-profile/${id}`;
    return this.http.get(api, { headers: this.headers }).pipe(
      map((res) => {
        return res || {};
      }));
  }

  // Error
  handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      msg = error.error.message;
    } else {
      // server-side error
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(msg);
  }

  getSchoolDetails(): Observable<any> {
    return this.dataService.get({ url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/school/${this.currentUser.schoolUdise}` }).pipe(map((res: any) => {
      if (res.success && res.result) {
        localStorage.setItem('schoolDetails', JSON.stringify(res.result));
        console.log('schoolDetails', this.schoolDetails);
        return res.result;
      } else {
        throwError(new Error('Error while fetching school details'));
      }
    }));
  }

  verifyAadhar(aadharId: number | string) {
    const api = `${this.endpoint}/ulp-bff/v1/aadhaar/verify`;
    return this.http.post(api, { aadhaar_id: aadharId });
  }

  verifyAccountAadharLink(payload: any) {
    const api = `${this.endpoint}/ulp-bff/v1/sso/digilocker/aadhaar`;
    return this.http.post(api, payload);
  }
}