import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { GeneralService } from '../services/general/general.service';


@Component({
  selector: 'app-ekyc',
  templateUrl: './ekyc.component.html',
  styleUrls: ['./ekyc.component.scss']
})
export class EkycComponent implements OnInit, AfterViewInit {

  userInfo: any;
  isLoading = false
  otp: number;

  canGoBack = false;
  otpModalRef: NgbModalRef;
  @ViewChild('otpModal') otpModal: TemplateRef<any>;

  aadharForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    aadharId: new FormControl('', [Validators.minLength(12), Validators.minLength(12), Validators.required, Validators.pattern('^[0-9]*$')])
  });

  constructor(
    private readonly authService: AuthService,
    private readonly toastMessage: ToastMessageService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly modalService: NgbModal,
    private readonly location: Location,
    private generalService: GeneralService,

  ) {
    const navigation = this.router.getCurrentNavigation();
    this.userInfo = navigation.extras.state;
    this.canGoBack = !!(this.router.getCurrentNavigation()?.previousNavigation);

    console.log("userInfo", this.userInfo);
    if (!this.userInfo) {
      if (this.canGoBack) {
        this.location.back();
      } else {
        this.router.navigate(['']);
      }
    }
  }

  ngOnInit(): void {
  }

  get aadharId() {
    return this.aadharForm.get('aadharId');
  }

  OnlyNumbersAllowed(event): boolean {
    const charCode = (event.which) ? event.which : event.keycode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  verifyAadhar() {
    this.aadharForm.controls['aadharId'].markAsTouched()
    if (!this.aadharForm.valid) {
      return;
    }
    this.isLoading = true;

    const payload = {
      "digiacc": "portal",
      "aadhaar_id": this.aadharForm.value.aadharId, //user input
      "aadhaar_name": this.userInfo?.result?.name, // digilocker
      "digilocker_id": this.userInfo?.result?.meripehchanid // meripehchan
    }
    this.authService.verifyAccountAadharLink(payload).subscribe((res: any) => {
      this.isLoading = false;
      console.log("Aadharlink Res", res);

      if (res.user === 'FOUND') {
        if (res.token) {
          localStorage.setItem('accessToken', res.token);
        }

        if (res?.userData?.length) {
          localStorage.setItem('currentUser', JSON.stringify(res.userData[0]));
        }
        this.router.navigate(['/dashboard']);
      }
      if (res?.user === 'NO_FOUND') {
        // redirect to registration
        const navigationExtras: NavigationExtras = {
          state: {...this.userInfo.result, uuid: res.result.uuid}
        };
        this.router.navigate(['/register'], navigationExtras)
      }
    }, error => {
      console.error();
      this.isLoading = false;
      this.toastMessage.error('', this.generalService.translateString('ERROR_WHILE_VERIFYING_AADHAR'));
    });
  }

  ngAfterViewInit(): void {
    this.raiseImpressionEvent();
    if (this.userInfo) {
      if (this.userInfo?.result?.name) {
        this.aadharForm.get('name').setValue(this.userInfo.result.name);
      }
    }
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
        // duration: this.navigationhelperService.getPageLoadTime() // Duration to load the page
      }
    };
    this.telemetryService.impression(telemetryImpression);
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


}
