import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, retry, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import {
  HttpClient, HttpErrorResponse, HttpHeaders
} from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../data/data-request.service';
import { UtilService } from '../util/util.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl: string;
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly dataService: DataService,
    private readonly utilService: UtilService
  ) {
    this.baseUrl = environment.baseUrl;
  }

  // Sign-up
  signUp(user): Observable<any> {
    const api = `${this.baseUrl}/v1/sso/student/register`;
    return this.http.post(api, user);
  }


  ssoSignUp(user: any) {
    const api = `${this.baseUrl}/v1/sso/digilocker/register`;
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
          throwError(new Error(this.utilService.translateString('ERROR_WHILE_REGISTRATION')));
        }
      }), retry(2));
  }

  // Sign-in
  signIn(user) {
    return this.http
      .post<any>(`${this.baseUrl}/v1/sso/student/login`, user)
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

  set digilockerAccessToken(token: string) {
    localStorage.setItem('digilockerAccessToken', token);
  }

  get digilockerAccessToken() {
    return localStorage.getItem('digilockerAccessToken');
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
    if (this.digilockerAccessToken){
      const payload = {
        "digiacc": "ewallet",
        "access_token": this.digilockerAccessToken
      }
      this.http.post(`${this.baseUrl}/v1/sso/digilocker/logout`, payload).subscribe();
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('digilockerAccessToken');
    setTimeout(() => {
      this.router.navigate(['']);
    });
  }

  // User profile
  getUserProfile(id: any): Observable<any> {
    let api = `${this.baseUrl}/v1/user-profile/${id}`;
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

  /**
   * Gets the details of the school associated with the current user.
   * @returns An observable that emits the school details when the HTTP request is successful.
   * @throws An error when the HTTP request fails.
   */
  getSchoolDetails(): Observable<any> {
    return this.dataService.get({ url: `${this.baseUrl}/v1/sso/school/${this.currentUser.schoolUdise}` }).pipe(map((res: any) => {
      if (res.success && res.result) {
        localStorage.setItem('schoolDetails', JSON.stringify(res.result));
        console.log('schoolDetails', this.schoolDetails);
        return res.result;
      } else {
        throwError(new Error(this.utilService.translateString('ERROR_WHILE_FETCHING_SCHOOL_DETAILS')));
      }
    }));
  }

  /**
   * Verifies the given Aadhaar ID by sending a POST request to the ULP BFF API.
   *
   * @param aadharId - The Aadhaar ID to verify.
   * @returns A Promise that resolves to the response of the POST request.
   */

  verifyAadhar(aadharId: number | string) {
    const api = `${this.baseUrl}/v1/aadhaar/verify`;
    return this.http.post(api, { aadhaar_id: aadharId });
  }

  verifyAccountAadharLink(payload: any) {
    const api = `${this.baseUrl}/v1/sso/digilocker/aadhaar`;
    return this.http.post(api, payload);
  }
}