import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  baseUrl: string;


  featureList = [
    'Issue academic certificates ',
    'Empower students to connect to opportunities',
    'Have a wholesome view of student performance'
  ]
  constructor(
    private readonly generalService: GeneralService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly toastMessageService: ToastMessageService
    ) {
      this.baseUrl = environment.baseUrl;

     }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  openSSO(buttonId: string) {
    this.raiseInteractEvent(buttonId)
    this.generalService.getData('${this.baseUrl}/v1/sso/digilocker/authorize/portal', true).subscribe((res) => {
      console.log("res", res);
      window.open(res.digiauthurl, "_self");
    }, error => {
      console.error(error);
      this.toastMessageService.error('', this.generalService.translateString('SOMETHING_WENT_WRONG'));
    });
  }

  ngAfterViewInit(): void {
    this.raiseImpressionEvent();
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
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
