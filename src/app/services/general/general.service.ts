import { EventEmitter, Injectable } from '@angular/core';
import { DataService } from '../data/data-request.service';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { TranslateService } from '@ngx-translate/core';
import { retry } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  private _pendingRequestCount = new BehaviorSubject<any>({ count: 0 });
  private _pendingRequestCount$ = this._pendingRequestCount.asObservable();
  baseUrl: string;

  // baseUrl = this.config.getEnv('baseUrl');
  translatedString: string;
  public languageChange = new EventEmitter<any>();
  constructor(public dataService: DataService, private config: AppConfig, public translate: TranslateService) {
    this.baseUrl = environment.baseUrl;
  }

  getPendingRequestCount() {
    return this._pendingRequestCount$;
  }

  setPendingRequestCount(count: number) {
    return this._pendingRequestCount.next({ count: count });
  }

  postData(apiUrl, data) {
    var url;
    if (apiUrl.indexOf('http') > -1) {
      url = apiUrl
    } else {
      if (apiUrl.charAt(0) == '/') {
        url = `${this.baseUrl}${apiUrl}`
      }
      else {
        url = `${this.baseUrl}/${apiUrl}`;
      }
    }

    const req = {
      url: url,
      data: data
    };

    return this.dataService.post(req);
  }

  getDocument(url: string): Observable<any> {
    return this.dataService.getDocument(url);
  }


  getData(apiUrl, outside: boolean = false) {
    var url;
    if (outside) {
      url = apiUrl;
    }
    else {
      url = `${this.baseUrl}/${apiUrl}`;
    }
    url.replace('//', '/');
    const req = {
      url: url
    };
    return this.dataService.get(req);
  }

  getPrefillData(apiUrl) {
    var url = apiUrl;
    let headers = new HttpHeaders();
    url.replace('//', '/');
    const req = {
      url: url,
      headers: headers
    };

    return this.dataService.get(req);
  }

  postPrefillData(apiUrl, data) {
    apiUrl.replace('//', '/');
    const req = {
      url: apiUrl,
      data: data
    };

    return this.dataService.post(req);
  }

  putData(apiUrl, id, data) {
    var url;
    if (apiUrl.charAt(0) == '/') {
      url = `${this.baseUrl}${apiUrl}/${id}`
    }
    else {
      url = `${this.baseUrl}/${apiUrl}/${id}`;
    }
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }

  // Configurations
  getConfigs() {
    let url = "./assets/config/config.json";
    const req = {
      url: url
    };

    return this.dataService.get(req);
  }

  updateclaims(apiUrl, data) {
    let url = `${this.baseUrl}${apiUrl}`;
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }

  translateString(constantStr) {
    this.translate.get(constantStr).subscribe((val) => {
      this.translatedString = val;
    });
    return this.translatedString;
  }

  postStudentData(apiUrl, data) {
    const req = {
      url: `${this.baseUrl}/v1/sso/studentDetailV2`,
      data: data
    };

    return this.dataService.post(req).pipe(retry(2));
  }

  approveStudentData(data) {
    const req = {
      url: `${this.baseUrl}/v1/credentials/approveStudentV2`,
      data: data
    };

    return this.dataService.post(req).pipe(retry(2));
  }


  rejectStudentData(data) {
    const req = {
      url: `${this.baseUrl}/v1/credentials/rejectStudentv2`,
      data: data
    };

    return this.dataService.post(req).pipe(retry(2));
  }

  setLanguage(langKey: string) {
    localStorage.setItem('setLanguage', langKey);
    this.translate.use(langKey);
  }

  getDaysDifference(fromDate: string, toDate?) {
    let date1 = new Date(fromDate);
    let date2 = new Date();
    if (toDate) {
      date2 = new Date(toDate);
    }
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '1 Day';
    }
    return `${diffDays} Days`
  }

  emitLanguageChangeEvent(language: any) {
    this.languageChange.emit(language);
  }
}

