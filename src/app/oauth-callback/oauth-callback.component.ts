import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss']
})
export class OauthCallbackComponent implements OnInit {

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly generalService: GeneralService,
    private readonly toastMessage: ToastMessageService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      console.log("params", params);
      if (params.code) {
        this.getUserData(params.code);
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
    this.generalService.postData('https://ulp.uniteframework.io/ulp-bff/v1/sso/digilocker/token', request).subscribe((res: any) => {
      console.log("Result", res);

      if (res.success) {
        if (res.user === 'FOUND') {
          if (res.token) {
            localStorage.setItem('accessToken', res.token);
          }

          if (res?.userData?.length) {
            localStorage.setItem('currentUser', JSON.stringify(res.userData[0]));
          }

          this.authService.getSchoolDetails().subscribe();
          this.router.navigate(['/dashboard']);
        }

        if (res.user === 'NO_FOUND' && res.result) {
          const navigationExtras: NavigationExtras = {
            state: res.result
          };
          this.router.navigate(['/register'], navigationExtras)
        }
      } else {
        this.toastMessage.error('', 'Error while login');
      }
    });
  }
}
