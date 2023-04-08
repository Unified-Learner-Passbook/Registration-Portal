import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from '../services/general/general.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { AuthService } from '../services/auth/auth.service';
import { Location } from '@angular/common';
import { CredentialService } from '../services/credential/credential.service';
import { concatMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss']
})
export class RegistrationFormComponent implements OnInit {

  registrationDetails: any;
  schoolDetails: any;
  udiseLinkModalRef: NgbModalRef;
  consentModalRef: NgbModalRef;
  maxDate = new Date().toISOString().split("T")[0];
  isDeclarationSubmitted = false;
  isVerified = null;
  schoolUdiseInput: string = '';
  isLoading = false;
  @ViewChild('udiseLinkModal') udiseLinkModal: TemplateRef<any>;
  @ViewChild('declarationModal') declarationModal: TemplateRef<any>;

  registrationForm = new FormGroup({
    schoolName: new FormControl(null, [Validators.required]),
    udiseId: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]),
    aadharId: new FormControl(null, [Validators.required]),
    joiningdate: new FormControl(null, [Validators.required, Validators.max(Date.now())]),
  });

  constructor(
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly generalService: GeneralService,
    private readonly toastMessage: ToastMessageService,
    private readonly authService: AuthService,
    private readonly location: Location,
    private readonly credentialService: CredentialService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.registrationDetails = navigation.extras.state;
    const canGoBack = !!(this.router.getCurrentNavigation()?.previousNavigation);

    if (!this.registrationDetails) {
      if (canGoBack) {
        this.location.back();
      } else {
        this.router.navigate(['']);
      }
    }
  }

  ngOnInit(): void { }

  get schoolName() {
    return this.registrationForm.get('schoolName');
  }

  get udiseId() {
    return this.registrationForm.get('udiseId');
  }

  get name() {
    return this.registrationForm.get('name');
  }

  get aadharId() {
    return this.registrationForm.get('aadharId');
  }

  get joiningdate() {
    return this.registrationForm.get('joiningdate');
  }

  get phone() {
    return this.registrationForm.get('phone');
  }

  ngAfterViewInit() {
    if (this.registrationDetails) {
      if (this.registrationDetails.name) {
        this.registrationForm.get('name').setValue(this.registrationDetails.name);
      }

      if (this.registrationDetails.mobile) {
        this.registrationForm.get('phone').setValue(this.registrationDetails.mobile);
      }

      if (this.registrationDetails.uuid) {
        this.registrationForm.get('aadharId').setValue(this.registrationDetails.uuid);
      }

    }
    const options: NgbModalOptions = {
      backdrop: 'static',
      animation: true,
      centered: true,
      size: 'sm'
    }
    console.log("schoolUdiseInput", this.schoolUdiseInput);
    this.udiseLinkModalRef = this.modalService.open(this.udiseLinkModal, options);
    this.raiseImpressionEvent();
  }

  linkUDISE() {
    if (this.registrationDetails) {
      this.toastMessage.success('', this.generalService.translateString('SUCCESSFULLY_LINKED'));
      if (this.schoolDetails?.udiseCode) {
        this.registrationForm.get('udiseId').setValue(this.schoolDetails.udiseCode);
      }

      if (this.schoolDetails?.schoolName) {
        this.registrationForm.get('schoolName').setValue(this.schoolDetails.schoolName);
      }
      this.udiseLinkModalRef.close();
    }
  }

  submitDeclarationForm(isConfirmed: boolean) {
    this.isDeclarationSubmitted = isConfirmed;
    this.consentModalRef.close()

    if (isConfirmed) {
      this.onSubmit();
    }
  }

  verifyUDISE() {
    this.generalService.getData(`https://ulp.uniteframework.io/ulp-bff/v1/sso/udise/school/list/${this.schoolUdiseInput}`, true).subscribe((res: any) => {
      if (res?.success && res?.status === 'found') {
        this.isVerified = "yes";
        this.schoolDetails = res.data;
      } else {
        this.isVerified = "no";
      }
    }, error => {
      this.isVerified = "no";
      console.error(error);
      this.toastMessage.error('', this.generalService.translateString('SOMETHING_WENT_WRONG'));
    })
  }

  onSubmit() {
    console.log(this.registrationForm.value);

    if (!this.isDeclarationSubmitted) {
      this.consentModalRef = this.modalService.open(this.declarationModal, { animation: true, centered: true });
      return;
    }

    if (this.registrationForm.valid) {
      this.isLoading = true;
      const payload = {
        digiacc: "portal",
        userdata: {
          teacher: {
            name: this.registrationForm.value.name,
            joiningdate: this.registrationForm.value.joiningdate,
            aadharId: this.registrationForm.value.aadharId,
            schoolUdise: this.registrationForm.value.udiseId,
            meripehchanLoginId: this.registrationDetails.meripehchanid,
            username: this.registrationDetails.uuid,
            consent: "yes",
            consentDate: new Date().toISOString().substring(0, 10),
            did: ""
          },
          school: { ...this.schoolDetails, stateCode: 16, did: "" } //ToDO remove hardcoded stateCode
        },
        digimpid: this.registrationDetails.meripehchanid,
      }

      // this.authService.verifyAadhar(this.registrationForm.value.aadharId).pipe(
      //   concatMap((res: any) => {
      //     if (res.success && res?.result?.aadhaar_token) {
      //       payload.userdata.teacher.aadharId = res.result.aadhaar_token;
      //       return this.authService.ssoSignUp(payload);
      //     } else {
      //       return throwError(this.generalService.translateString('AADHAR_VERIFICATION_FAILED'));  
      //     }
      //   }),
      this.authService.ssoSignUp(payload).pipe(
        concatMap(_ => this.authService.getSchoolDetails()),
        concatMap(_ => this.credentialService.issueCredential())
      ).subscribe((res: any) => {
        this.isLoading = false;
        console.log("final", res);
        this.toastMessage.success("", this.generalService.translateString('USER_REGISTERED_SUCCESSFULLY'));
        this.router.navigate(['/dashboard'], { state: { isFirstTimeLogin: true } });
      }, (error: any) => {
        console.error(error);
        this.isLoading = false;
        this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_REGISTER_USER'));
      });
    }
  }

  objectValuesToString(obj: any) {
    Object.keys(obj).forEach((key: any) => {
      if (typeof obj[key] === 'object') {
        return this.objectValuesToString(obj[key]);
      }
      obj[key] = '' + obj[key];
    });
    return obj;
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
