import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { GeneralService } from '../services/general/general.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss']
})
export class RegistrationFormComponent implements OnInit {

  registrationDetails: any;
  schoolDetails: any;
  modalRef: NgbModalRef;
  @ViewChild('udiseLinkModal') udiseLinkModal: TemplateRef<any>;

  registrationForm = new FormGroup({
    schoolName: new FormControl(null, [Validators.required, Validators.pattern('[a-zA-Z]+$')]),
    udiseId: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required, Validators.minLength(2)]),
    phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]),
    aadharId: new FormControl(null, [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern('^[0-9]*$')]),
    joiningdate: new FormControl(null, [Validators.required]),
    consent: new FormControl(false, [Validators.required, Validators.requiredTrue])
  });

  constructor(
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly generalService: GeneralService,
    private readonly toastMessage: ToastMessageService,
    private readonly authService: AuthService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.registrationDetails = navigation.extras.state;
  }

  ngOnInit(): void { }

  ngAfterViewInit() {
    if (this.registrationDetails) {
      if (this.registrationDetails?.name) {
        this.registrationForm.get('name').setValue(this.registrationDetails.name);
      }

      if (this.registrationDetails?.mobile) {
        this.registrationForm.get('phone').setValue(this.registrationDetails.mobile);
      }
    }
    const options: NgbModalOptions = {
      backdrop: 'static',
      animation: true,
      centered: true,

    }
    this.modalRef = this.modalService.open(this.udiseLinkModal, options);
  }

  linkUDISE() {
    this.generalService.getData('https://ulp.uniteframework.io/ulp-bff/v1/sso/udise/verify/myschool1234', true).subscribe((res: any) => {
      this.schoolDetails = res;
      this.toastMessage.success('', 'Successfully Linked!');
      this.modalRef.close();
    });
  }

  onSubmit() {
    console.log(this.registrationForm.value);
    if (this.registrationForm.valid) {

      const payload = {
        digiacc: "portal",
        userdata: {
          teacher: {
            name: this.registrationForm.value.name,
            joiningdate: this.registrationForm.value.joiningdate,
            aadharId: this.registrationForm.value.aadharId,
            schoolUdise: this.schoolDetails.udiseCode,
            meripehchanLoginId: this.registrationDetails.meripehchanid,
            username: this.registrationDetails.meripehchanid,
            consent: "yes",
            consentDate: Date.now(),
            did: ""
          },
          school: { ...this.schoolDetails, did: "" }
        },
        digimpid: this.registrationDetails.meripehchanid
      }

      this.authService.ssoSignUp(payload).subscribe((res: any) => {
        console.log("result register", res);
        if (res.success && res.user === 'FOUND') {

          if (res.token) {
            localStorage.setItem('accessToken', res.token);
          }

          if (res?.userData?.student) {
            localStorage.setItem('currentUser', JSON.stringify(res.userData.student));
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

}
