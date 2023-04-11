import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthConfigService {
  private config: any;

  constructor(private httpClient: HttpClient) { }

  public getConfig(): Observable<any> {
    if (this.config) {
      return of(this.config);
    }
    return this.httpClient.get('./assets/config/config.json').pipe(
      catchError((error) => {
        console.log(error)
        return of(null)
      }),
      map((response) => {
        if (response) {
          this.config = response;
          return response;
        } else {
          return null;
        }
      }));
  }
}
