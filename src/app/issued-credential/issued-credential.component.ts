import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { concatMap, map } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { CredentialService } from '../services/credential/credential.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

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
  startYear = 2015;
  currentYear = new Date().getFullYear();
  academicYearRange: string[] = [];
  model: any = {};
  studentDetails = [];
  grades: any[];

  constructor(
    private readonly authService: AuthService,
    private readonly toastMessage: ToastMessageService,
    private readonly router: Router,
    private readonly credentialService: CredentialService,
    private readonly generalService: GeneralService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly utilService: UtilService,
    private readonly toastService: ToastMessageService
  ) { }

  ngOnInit(): void {
    this.getCredentials();
    this.setAcademicYear();
    this.setGrades();
  }

  setGrades() {
    const ordinals = this.utilService.getNumberOrdinals(1, 10);
    this.grades = ordinals.map((item: string, index: number) => {
      return {
        label: item,
        value: `class-${index + 1}`
      }
    });
  }

  setAcademicYear() {
    for (let fromYear = this.startYear; fromYear < this.currentYear; fromYear++) {
      this.academicYearRange.push(`${fromYear}-${fromYear + 1}`);
    }
  }

  onModelChange() {
    this.getCredentials();
  }

  onChange(event) {
    // console.log("event", this.selectedType);
    // this.getCredentials();
    // console.log(this.model);
  }

  getCredentials() {
    this.isLoading = true;
    this.issuedCredentials = [];
    this.tableRows = [];
    this.page = 1;
    let payload = {
      issuerId: this.authService?.schoolDetails?.did,
      grade: this.model.grade,
      academicYear: this.model.academicYear
    }

    this.credentialService.getCredentials('student', payload).subscribe((res) => {
      this.isLoading = false;
      // Filter out credentials for students only
      this.issuedCredentials = res.filter((credential: any) => !!credential?.credentialSubject?.grade).map((item: any) => {
        if (item.credentialSubject.enrolled_on && !dayjs(item.credentialSubject.enrolled_on).isValid()) {
          item.credentialSubject.enrolled_on = dayjs(item.credentialSubject.enrolled_on, 'MM/YYYY').format();

          if (item.credentialSubject.enrolled_on === 'Invalid Date') {
            item.credentialSubject.enrolled_on = '';
          }
        }
        return item;
      });
      this.pageChange();
    }, (error: any) => {
      this.isLoading = false;
      this.issuedCredentials = [];
      if (error.status !== 400 || error?.error?.result?.error?.status !== 404) {
        this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_ISSUED_CREDENTIALS'));
      }
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
