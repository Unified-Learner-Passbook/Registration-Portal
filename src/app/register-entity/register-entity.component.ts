import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as Papa from "papaparse";
import { DataService } from '../services/data/data-request.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import * as _ from 'lodash-es'
import { concatMap, tap, toArray } from 'rxjs/operators';
import { from, throwError } from 'rxjs';
import { CsvService } from '../services/csv/csv.service';
import { RequestParam } from '../interfaces/httpOptions.interface';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';


const BATCH_LIMIT = 20;
@Component({
  selector: 'app-register-entity',
  templateUrl: './register-entity.component.html',
  styleUrls: ['./register-entity.component.scss']
})
export class RegisterEntityComponent implements OnInit {
  tableColumns: string[] = [];
  tableRows: any[] = [];
  allDataRows: any[] = [];
  parsedCSV: any[] = [];
  grades = [
    {
      label: '1st',
      value: 'class-1'
    },
    {
      label: '2nd',
      value: 'class-2'
    },
    {
      label: '3rd',
      value: 'class-3'
    },
    {
      label: '4th',
      value: 'class-4'
    },
    {
      label: '5th',
      value: 'class-5'
    },
    {
      label: '6th',
      value: 'class-6'
    },
    {
      label: '7th',
      value: 'class-7'
    },
    {
      label: '8th',
      value: 'class-8'
    },
    {
      label: '9th',
      value: 'class-9'
    },
    {
      label: '10th',
      value: 'class-10'
    },
  ];
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
      isEnabled: false,
      schemaId: 'clf0qfvna0000tj154706406y'
    },
    {
      label: 'Proof of Benefits',
      value: 'proofOfBenifits',
      isEnabled: false,
      schemaId: 'clf0wvyjs0008tj154rc071i1'
    }
  ];
  startYear = 2000;
  currentYear = new Date().getFullYear();
  academicYearRange: string[] = [];
  model: any = {};
  isLoading = false;
  showProgress = false;
  progress = 0;
  currentBatch = 0;
  totalBatches: number;
  studentList: any[];

  page = 1;
  pageSize = 30;

  downloadResModalRef: NgbModalRef;
  @ViewChild('downloadResModal') downloadResponseModal: TemplateRef<any>;

  errorMessage: string;
  constructor(
    private readonly dataService: DataService,
    private readonly toastMsg: ToastMessageService,
    private readonly csvService: CsvService,
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    private readonly generalService: GeneralService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService

  ) { }

  ngOnInit(): void {
    this.setAcademicYear();
  }

  setAcademicYear() {
    for (let fromYear = this.startYear; fromYear < this.currentYear; fromYear++) {
      // const toYear = (fromYear + 1).toString().substring(2);
      this.academicYearRange.push(`${fromYear}-${fromYear + 1}`);
    }
  }

  downloadTemplate() {
    // let link = document.createElement("a");
    // link.setAttribute('type', 'hidden');
    // link.download = "registration-template";
    // link.href = "assets/template/registration-template.csv";
    // link.click();
    // link.remove();

    console.log('model', this.model);
    this.model.certificateType = 'proofOfEnrollment';
    if (this.model?.certificateType) {
      const schemaId = this.certificateTypes.find(item => item.value === this.model.certificateType)?.schemaId;

      // this.csvService.getTemplateSchema('did:ulpschema:8b8eda70-6dfb-43e6-8a8a-6084188ce516')
      this.csvService.getTemplateSchema(schemaId)
        .pipe(
          tap((res: any) => {
            if (res?.result?.schema?.properties) {
              // const columnFields = Object.keys(res.result.schema.properties);
              const columnFields = ["studentName", "student_id", "mobile", "gaurdian_name", "aadhar_token", "dob"]
              const csvContent = this.csvService.generateCSV(columnFields);
              this.csvService.downloadCSVTemplate(csvContent, `${this.model.certificateType}-template`);
            } else {
              throwError(() => new Error('properties unavailable in the schema'));
            }
          })).subscribe(() => { }, (error) => {
            const errorMessage = error?.message ? error.message : 'Unable to download Template'
            this.toastMsg.error('', errorMessage);
            console.error(errorMessage);
          });
    }
  }

  resetTableData() {
    this.errorMessage = '';
    this.tableColumns = [];
    this.tableRows = [];
    this.allDataRows = [];
  }

  public async importDataFromCSV(event: any) {
    try {
      this.resetTableData();
      this.parsedCSV = await this.parseCSVFile(event);
      // const columns = Object.keys(this.parsedCSV[0]);
      // this.tableColumns = columns.map((header: string) => header.replace(/_/g, " ").trim());
      this.tableColumns = Object.keys(this.parsedCSV[0]);
      this.allDataRows = this.parsedCSV.map(item => Object.values(item));

      this.saveAndVerify();
      this.pageChange();
    } catch (error) {
      this.errorMessage = error?.message ? error.message : this.generalService.translateString('ERROR_WHILE_PARSING_CSV_FILE');
      console.warn("Error while parsing csv file", error);
    }
  }

  parseCSVFile(inputValue): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(inputValue.target.files[0], {
        header: true,
        skipEmptyLines: true,
        error: (err) => {
          console.warn("Error while parsing CSV file", err);
          reject(err);
        },
        complete: (results) => {
          if (results?.errors?.length) {
            reject(results.errors[0]);
          } else {
            resolve(results.data);
          }
        }
      });
    });
  }

  onModelChange() {
    if (this.model.grade && this.model.academicYear) {
      this.getStudentList();
    }
  }

  private getTextFromFile(inputValue: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const file: File = inputValue.target.files[0];
      const myReader: FileReader = new FileReader();
      myReader.readAsText(file);

      myReader.onloadend = (e) => {
        let fileString: string = myReader.result as string;
        resolve(fileString);
      };

      myReader.onerror = (e) => {
        reject(e);
      }

      myReader.onprogress = (e) => {
        console.info("progress", e)
      }
    });
  }

  pageChange() {
    this.tableRows = this.studentList.map((row, i) => row).slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  saveAndVerify() {
    console.log("parsedCSV", this.parsedCSV);
    console.log("model", this.model);

    const dataBatches = _.chunk(this.parsedCSV, BATCH_LIMIT);
    console.log("dataBatches", dataBatches);
    this.isLoading = true;
    this.showProgress = true;
    this.progress = 0;
    this.totalBatches = dataBatches.length;

    from(dataBatches)
      .pipe(
        concatMap((data: any[]) => {
          // return this.importData(data)
          return this.bulkRegister(data)
        }),
        tap((response) => {
          console.log(response);
          this.currentBatch++;
          this.progress = Math.ceil((this.currentBatch / this.totalBatches) * 100);
        }),
        toArray()
      ).subscribe((res) => {
        console.log("final", res);
        this.toastMsg.success('', this.generalService.translateString('STUDENTS_DATA_IMPORTED_SUCCESSFULLY'));
        this.resetTableData();
        this.isLoading = false;
        setTimeout(() => {
          this.progress = 1;
          this.showProgress = false;
        }, 2000);
      }, (error) => {
        console.log("error", error);
        this.toastMsg.error('', this.generalService.translateString('ERROR_WHILE_IMPORTING_DATA'));
        this.isLoading = false;
        this.showProgress = false;
      });
  }

  importData(list: any[]) {
    const request: RequestParam = {
      url: `https://ulp.uniteframework.io/ulp-bff/v1/credentials/upload/${this.model.certificateType}`,
      // param: new HttpParams().append('type', this.model.certificateType),
      data: {
        grade: this.model.grade,
        academicYear: this.model.academicYear,
        issuer: this.authService.schoolDetails?.did,
        schoolName: this.authService.schoolDetails?.schoolName,
        credentialSubject: list
      }
    }
    return this.dataService.post(request);
  }


  bulkRegister(list: any[]) {
    // const studentList = list.map((item: any) => {
    //   return {
    //     "studentName": item.studentName,
    //     "student_id": item.studentId,
    //     "mobile": ,
    //     "gaurdian_name": "",
    //     "aadhar_token": "",
    //     "dob": ""
    //   }
    // });

    const request: RequestParam = {
      url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/student/bulk/register`,
      data: {
        "schoolDetails":
        {
          "grade": this.model.grade,
          "schoolUdise": this.authService.schoolDetails?.udiseCode,
          "schoolName": this.authService.schoolDetails?.schoolName,
          "academic-year": this.model.academicYear,
          "school_type": "private"
        },
        "studentDetails": list
      }
    }

    return this.dataService.post(request);
  }

  getStudentList() {
    this.studentList = [];
    this.isLoading = true;
    const request = {
      url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/student/list`,
      data: {
        "grade": this.model.grade,
        "acdemic_year": this.model.academicYear
      }
    }
    this.dataService.post(request).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.result?.length) {
        this.studentList = res.result.map((item: any) => {
          return {
            did: item.student.DID,
            studentId: item.student.student_id,
            name: item.student.student_name,
            dob: item.student.dob,
            mobile: item.studentdetail.mobile,
            guardian: item.studentdetail.gaurdian_name,
            osid: item.studentdetail.osid
          }
        });
        this.pageChange();
      }
    }, (error: any) => {
      this.isLoading = false;
      this.toastMsg.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_STUDENT_LIST'));
    });
  }

  issueBulkCredentials() {
    this.isLoading = true;
    const date = new Date();
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    const request = {
      url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/student/bulk/credentials`,
      data: {
        "credentialSubjectCommon": {
          "grade": this.model.grade,
          "academicYear": this.model.academicYear
        },
        "credentialSubject": this.studentList.map((item: any) => {
          return {
            "id": item.did,
            "enrolledOn": date.toISOString(),
            "studentName": item.name,
            "guardianName": item.guardian,
            "issuanceDate": date.toISOString(),
            "expirationDate": nextYear.toISOString(),
            "osid": item.osid
          }
        }),
        "issuerDetail": {
          "did": this.authService.schoolDetails?.did,
          "schoolName": this.authService.schoolDetails?.schoolName,
          "schemaId": "clf0rjgov0002tj15ml0fdest" //TODO Need to update hard coded value
        }
      }
    }

    this.dataService.post(request).subscribe((res: any) => {
      this.isLoading = false;
      this.openDownloadResponsePopup();
      if (res.success) {
        this.getStudentList();
        this.toastMsg.success("", this.generalService.translateString('CREDENTIAL_ISSUED_SUCCESSFULLY'));
      } else {
        this.toastMsg.error("", this.generalService.translateString('ERROR_WHILE_ISSUING_CREDENTIALS'));
      }
    }, (error: any) => {
      this.isLoading = false;
      this.toastMsg.error("", this.generalService.translateString('ERROR_WHILE_ISSUING_CREDENTIALS'));
    });
  }

  openDownloadResponsePopup() {
    //Ask if want to download the response 
  }

  saveResponse(result: any) {
    const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = 'response.json';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

