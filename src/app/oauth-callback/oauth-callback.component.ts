import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss']
})
export class OauthCallbackComponent implements OnInit {
  baseUrl: string;
  isError = false;
  errorCode: string;
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly generalService: GeneralService,
    private readonly toastMessage: ToastMessageService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly telemetryService: TelemetryService
  ) {
    this.baseUrl = environment.baseUrl;

    this.activatedRoute.queryParams.subscribe((params: any) => {
      console.log("params", params);
      if (params.code) {
        this.getUserData(params.code);
      }

      if (params.error) {
        this.isError = true;
        this.errorCode = params.error;
      }
    });
  }

  ngOnInit(): void {
    const redirectUrl = this.activatedRoute.snapshot.queryParamMap.get('code');
    console.log("redirectUrl", redirectUrl);
  }

  getUserData(code: string) {
    const request = {
      digiacc: "portal",
      auth_code: code
    }
    this.generalService.postData(`${this.baseUrl}/v1/sso/digilocker/token`, request).subscribe((res: any) => {
      console.log("Result", res);

      if (res.success) {
        if (res?.needaadhaar === 'YES') {
          const navigationExtras: NavigationExtras = {
            state: res
          }
          this.router.navigate(['/ekyc'], navigationExtras);
        } else {
          if (res.user === 'FOUND') {
            if (res.token) {
              localStorage.setItem('accessToken', res.token);
            }

            if (res?.userData?.length) {
              localStorage.setItem('currentUser', JSON.stringify(res.userData[0]));
            }
  
            this.authService.getSchoolDetails().subscribe(); // Add concatMap
            this.router.navigate(['/dashboard']);
          }
  
          if (res.user === 'NO_FOUND' && res.result) {
            const navigationExtras: NavigationExtras = {
              state: res.result
            };
            this.router.navigate(['/register'], navigationExtras)
          }
        }
      } else {
        console.error(res);
        this.toastMessage.error('', this.generalService.translateString('ERROR_WHILE_LOGIN'));
      }
    }, (error) => {
      console.error(error);
      this.toastMessage.error('', this.generalService.translateString('ERROR_WHILE_LOGIN'));
    });
  }

  ngAfterViewInit(): void {
    this.raiseImpressionEvent();
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
    console.log("raiseInteractEvent")
    const telemetryInteract: IInteractEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        id,
        type,
        subtype,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
      }
    };
    this.telemetryService.interact(telemetryInteract);
  }

  raiseImpressionEvent() {
    const telemetryImpression: IImpressionEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        type: this.activatedRoute.snapshot?.data?.telemetry?.type,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
        uri: this.router.url,
        subtype: this.activatedRoute.snapshot?.data?.telemetry?.subtype,
      }
    };
    this.telemetryService.impression(telemetryImpression);
  }
}
