import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { GeneralService } from '../services/general/general.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { AuthService } from '../services/auth/auth.service';
import { Location } from '@angular/common';

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
  userConsent = false;
  isVerified = null;
  schoolNameInput: string = '';
  @ViewChild('udiseLinkModal') udiseLinkModal: TemplateRef<any>;
  @ViewChild('declarationModal') declarationModal: TemplateRef<any>;

  registrationForm = new FormGroup({
    schoolName: new FormControl(null, [Validators.required]),
    udiseId: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]),
    aadharId: new FormControl(null, [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern('^[0-9]*$')]),
    joiningdate: new FormControl(null, [Validators.required, Validators.max(Date.now())]),
    // consent: new FormControl(false, [Validators.required, Validators.requiredTrue])
  });

  constructor(
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly generalService: GeneralService,
    private readonly toastMessage: ToastMessageService,
    private readonly authService: AuthService,
    private readonly location: Location
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

    }
    const options: NgbModalOptions = {
      backdrop: 'static',
      animation: true,
      centered: true,
      size: 'sm'
    }
    this.udiseLinkModalRef = this.modalService.open(this.udiseLinkModal, options);
  }

  linkUDISE() {
    // this.generalService.getData('https://ulp.uniteframework.io/ulp-bff/v1/sso/udise/verify/myschool1234', true).subscribe((res: any) => {
    //   this.schoolDetails = res;
    //   this.toastMessage.success('', 'Successfully Linked!');
    //   if (this.schoolDetails?.udiseCode) {
    //     this.registrationForm.get('udiseId').setValue(this.schoolDetails.udiseCode);
    //   }

    //   if (this.schoolDetails?.schoolName) {
    //     this.registrationForm.get('schoolName').setValue(this.schoolDetails.schoolName);
    //   }
    //   this.udiseLinkModalRef.close();
    // });

    if (this.registrationDetails) {
      this.toastMessage.success('', 'Successfully Linked!');
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
    this.userConsent = isConfirmed;
    this.consentModalRef.close()

    if (isConfirmed) {
      this.onSubmit();
    }
  }

  verifyUDISE(udiseId: string) {
    this.generalService.getData(`https://ulp.uniteframework.io/ulp-bff/v1/sso/udise/school/list/${this.schoolNameInput}`, true).subscribe((res: any) => {
      if (res?.success && res?.status === 'found') {
        this.isVerified = "yes";
        this.schoolDetails = res.data;
      } else {
        this.isVerified = "no";
      }
    })
  }

  onSubmit() {
    console.log(this.registrationForm.value);

    if (!this.isDeclarationSubmitted) {
      this.consentModalRef = this.modalService.open(this.declarationModal, { animation: true, centered: true });
      return;
    }

    const newMeriPehchaanId = this.registrationDetails.meripehchanid + Math.floor(Math.random() * 10000);
    const newUDISE = this.schoolDetails.udiseCode + Math.floor(Math.random() * 10000);
    if (this.registrationForm.valid) {
      const payload = {
        digiacc: "portal",
        userdata: {
          teacher: {
            name: this.registrationForm.value.name,
            joiningdate: this.registrationForm.value.joiningdate,
            aadharId: this.registrationForm.value.aadharId,
            schoolUdise: this.registrationForm.value.udiseId,//newUDISE, //this.schoolDetails.udiseCode,
            meripehchanLoginId: this.registrationDetails.meripehchanid,
            username: this.registrationDetails.meripehchanid,
            consent: "yes",
            consentDate: new Date().toISOString().substring(0, 10),
            did: ""
          },
          school: { ...this.schoolDetails, stateCode: 16, did: "", udiseCode: newUDISE } //ToDO remove hardcoded stateCode
        },
        digimpid: this.registrationDetails.meripehchanid,
      }

      this.authService.ssoSignUp(payload).subscribe((res: any) => {
        console.log("result register", res);
        if (res.success && res.user === 'FOUND') {

          if (res.token) {
            localStorage.setItem('accessToken', res.token);
          }

          if (res?.userData?.teacher) {
            localStorage.setItem('currentUser', JSON.stringify(res.userData.teacher));
          }
          this.router.navigate(['/dashboard']);
          this.toastMessage.success("", "User Registered successfully!");

        } else {
          this.toastMessage.error("", res.message);
        }
      }, (error) => {
        this.toastMessage.error("", error.message);
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
}
