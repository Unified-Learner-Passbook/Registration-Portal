import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeneralService } from '../services/general/general.service';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss']
})
export class OauthCallbackComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService
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
      digiacc:"portal",
      auth_code: code
    }
    this.generalService.postData('https://ulp.uniteframework.io/ulp-bff/v1/sso/digilocker/token', request).subscribe((res) => {
      console.log("Result", res);
    });
  }
}
