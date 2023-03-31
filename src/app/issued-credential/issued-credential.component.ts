import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { CredentialService } from '../services/credential/credential.service';
import { DataService } from '../services/data/data-request.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { GeneralService } from '../services/general/general.service';


@Component({
  selector: 'app-issued-credential',
  templateUrl: './issued-credential.component.html',
  styleUrls: ['./issued-credential.component.scss']
})
export class IssuedCredentialComponent implements OnInit {

  selectedType = 'proofOfEnrollment';
  schoolDetails: any;
  credentials: any[] = [];
  issuedCredentials = [];
  isLoading = false;
  allCredentials = [];
  certificateTypes = [
    {
      label: 'Proof of Enrollment',
      value: 'proofOfEnrollment',
      isEnabled: true,
      schemaId: 'clf0rjgov0002tj15ml0fdest'
    },
    {
      label: 'Proof of Assessment',
      value: 'proofOfAssessment',
      isEnabled: true,
      schemaId: 'clf0qfvna0000tj154706406y'
    },
    {
      label: 'Proof of Benefits',
      value: 'proofOfBenifits',
      isEnabled: true,
      schemaId: 'clf0wvyjs0008tj154rc071i1'
    }
  ];
  constructor(
    private readonly authService: AuthService,
    private readonly dataService: DataService,
    private readonly toastMessage: ToastMessageService,
    private readonly router: Router,
    private readonly credentialService: CredentialService,
    private readonly generalService: GeneralService,


  ) { }

  ngOnInit(): void {
    // this.getSchoolDetails();
    // this.authService.getSchoolDetails().subscribe((res: any) => {
    //   this.schoolDetails = res;
    //   this.getCredentials();
    // }, (error: any) => {
    //   console.error(error);
    // });
    this.schoolDetails = this.authService.schoolDetails;
  }

  onChange(event) {
    console.log("event", this.selectedType);
    this.getCredentials();
  }

  // getSchoolDetails() {
  //   // const udiseId = this.authService.currentUser.schoolUdise;
  //   // this.dataService.get({ url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/school/${udiseId}` }).subscribe((res: any) => {
  //   //   this.schoolDetails = res.result;
  //   //   console.log('schoolDetails', this.schoolDetails);
  //   // });
  // }

  getCredentials() {
    this.isLoading = true;
    // const payload = {
    //   url: 'https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/search',
    //   data: {
    //     issuer: {
    //       id: this.schoolDetails.did
    //     }
    //   }
    // };

    // this.dataService.post(payload).subscribe((res: any) => {
    //   console.log("res", res);
    //   this.isLoading = false;
    //   if (res.success && res.result?.length) {
    //     this.allCredentials = res.result;
    //     this.issuedCredentials = res.result;
    //     // this.issuedCredentials = res.result.map((item: any) => {
    //     //   return {
    //     //     studentName: item.credentialSubject.studentName,
    //     //     studentId: item.credentialSubject?.studentId || '',
    //     //     phoneNumber: item.credentialSubject.mobile,
    //     //     credentialId: item.id
    //     //   }
    //     // });
    //   }
    // }, (error: any) => {
    //   this.isLoading = false;
    //   this.toastMessage.error("", "Error while fetching issued Credentials");
    // });

    this.credentialService.getAllCredentials(this.schoolDetails.did).subscribe((res) => {
      this.isLoading = false;
      this.issuedCredentials = res;
    }, (error: any) => {
      this.isLoading = false;
      this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_ISSUED_CREDENTIALS'));
    });
  }

  viewCredential(credential: any) {
    const navigationExtra: NavigationExtras = {
      state: credential
    }
    this.router.navigate(['/dashboard/doc-view'], navigationExtra);
  }
}
