import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { CredentialService } from '../services/credential/credential.service';
import { DataService } from '../services/data/data-request.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { GeneralService } from '../services/general/general.service';
import { concatMap, map } from 'rxjs/operators';


@Component({
  selector: 'app-issued-credential',
  templateUrl: './issued-credential.component.html',
  styleUrls: ['./issued-credential.component.scss']
})
export class IssuedCredentialComponent implements OnInit {

  selectedType = 'proofOfEnrollment';
  credentials: any[] = [];
  issuedCredentials = [];
  isLoading = false;
  page = 1;
  pageSize = 20;
  tableRows: any[] = [];
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
    private readonly toastMessage: ToastMessageService,
    private readonly router: Router,
    private readonly credentialService: CredentialService,
    private readonly generalService: GeneralService
  ) { }

  ngOnInit(): void {
    this.getCredentials();
  }

  onChange(event) {
    console.log("event", this.selectedType);
    this.getCredentials();
  }

  getCredentials() {
    this.isLoading = true;
    this.credentialService.getCredentials(this.authService?.schoolDetails?.did).subscribe((res) => {
      this.isLoading = false;
      this.issuedCredentials = res;
      this.pageChange();
    }, (error: any) => {
      this.isLoading = false;
      this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_ISSUED_CREDENTIALS'));
    });
  }

  viewCredential(credential: any) {
    this.credentialService.getCredentialSchemaId(credential.id).pipe(
      concatMap((res: any) => {
        credential.schemaId = res.credential_schema;
        return this.credentialService.getSchema(res.credential_schema).pipe(
          map((schema: any) => {
            credential.credential_schema = schema;
            return credential;
          })
        );
      })
    ).subscribe((res: any) => {
      const navigationExtra: NavigationExtras = {
        state: credential
      }
      this.router.navigate(['/dashboard/doc-view'], navigationExtra);
    }, (error: any) => {
      console.error(error);
      this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_ISSUED_CREDENTIALS'));
    });
  }

  pageChange() {
    this.tableRows = this.issuedCredentials.map((row, i) => row).slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }
}
