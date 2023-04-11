import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as Papa from "papaparse";
import { DataService } from '../services/data/data-request.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import * as _ from 'lodash-es'
import { catchError, concatMap, tap, toArray } from 'rxjs/operators';
import { forkJoin, from, of, throwError } from 'rxjs';
import { CsvService } from '../services/csv/csv.service';
import { RequestParam } from '../interfaces/httpOptions.interface';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { UtilService } from '../services/util/util.service';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CredentialService } from '../services/credential/credential.service';

const BATCH_LIMIT = 10;
@Component({
  selector: 'app-register-entity',
  templateUrl: './register-entity.component.html',
  styleUrls: ['./register-entity.component.scss']
})
export class RegisterEntityComponent implements OnInit {
  baseUrl: string;

  tableColumns: string[] = [];
  tableRows: any[] = [];
  parsedCSV: any[] = [];
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
  startYear = 2015;
  currentYear = new Date().getFullYear();
  academicYearRange: string[] = [];
  model: any = {};
  grades: any[];
  isLoading = false;
  showProgress = false;
  progress = 0;
  currentBatch = 0;
  totalBatches: number;
  studentList: any[];
  allStudents: any[] = [];
  selectedStudent: any;

  strictLoader = false;

  page = 1;
  pageSize = 20;

  bulkRegRes: any;
  bulkIssuedCredRes: any;
  downloadResModalRef: NgbModalRef;
  downloadIssuedResModalRef: NgbModalRef;
  declarationModalRef: NgbModalRef;
  editFormModalRef: NgbModalRef;

  @ViewChild('downloadResModal') downloadResModal: TemplateRef<any>;
  @ViewChild('downloadIssuedResModal') downloadIssuedResModal: TemplateRef<any>;
  @ViewChild('declarationModal') declarationModal: TemplateRef<any>;
  @ViewChild('editFormModal') editFormModal: TemplateRef<any>;

  errorMessage: string;
  editStudentForm = new FormGroup({
    studentName: new FormControl(null, [Validators.required]),
    studentId: new FormControl(null, [Validators.required]),
    guardianName: new FormControl(null, [Validators.required]),
    mobile: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]),
    aadharNumber: new FormControl(null, [Validators.required]),
    dob: new FormControl(null, [Validators.required]),
  });

  constructor(
    private readonly dataService: DataService,
    private readonly toastMsg: ToastMessageService,
    private readonly csvService: CsvService,
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    private readonly generalService: GeneralService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly utilService: UtilService,
    private readonly credentialService: CredentialService
  ) {
    this.baseUrl = environment.baseUrl;
  }

  ngOnInit(): void {
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
      // const toYear = (fromYear + 1).toString().substring(2);
      this.academicYearRange.push(`${fromYear}-${fromYear + 1}`);
    }
  }

  downloadTemplate() {
    this.model.certificateType = 'proofOfEnrollment';
    if (this.model?.certificateType) {
      const schemaId = this.certificateTypes.find(item => item.value === this.model.certificateType)?.schemaId;
      this.csvService.getTemplateSchema(schemaId)
        .pipe(
          tap((res: any) => {
            if (res?.result?.schema?.properties) {
              // const columnFields = Object.keys(res.result.schema.properties);
              const columnFields = ["studentName", "student_id", "mobile", "gaurdian_name", "aadhar_token", "dob"] //TODO: Add label field in schema and use it here
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

  // resetTableData() {
  //   this.errorMessage = '';
  //   this.tableColumns = [];
  //   this.tableRows = [];
  //   this.allDataRows = [];
  // }

  public async importDataFromCSV(event: any) {
    try {
      // this.resetTableData();
      this.parsedCSV = await this.parseCSVFile(event);

      if (!this.parsedCSV.length) {
        throw new Error('It seems you have uploaded empty csv file, please upload valid csv file');
      }

      // const columns = Object.keys(this.parsedCSV[0]);
      // this.tableColumns = columns.map((header: string) => header.replace(/_/g, " ").trim());
      this.tableColumns = Object.keys(this.parsedCSV[0]);
      // this.allDataRows = this.parsedCSV.map(item => Object.values(item));
      this.uploadCsvValues();
      this.pageChange();
    } catch (error) {
      this.errorMessage = error?.message ? error.message : this.generalService.translateString('ERROR_WHILE_PARSING_CSV_FILE');
      this.toastMsg.error('', this.errorMessage);
      console.warn("Error while parsing csv file", error);
    }
  }

  parseCSVFile(inputValue): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(inputValue.target.files[0], {
        header: true,
        skipEmptyLines: true,
        error: (err) => {
          console.error("err", err);
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

  pageChange() {
    this.tableRows = this.studentList.map((row, i) => row).slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  uploadCsvValues() {
    console.log("parsedCSV", this.parsedCSV);
    console.log("model", this.model);

    const dataBatches = _.chunk(this.parsedCSV, BATCH_LIMIT);
    console.log("dataBatches", dataBatches);
    this.strictLoader = true;
    this.showProgress = true;
    this.progress = 0;
    this.currentBatch = 0;
    this.totalBatches = dataBatches.length;

    this.bulkRegRes = {};
    from(dataBatches)
      .pipe(
        concatMap((data: any[]) => {
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
        setTimeout(() => {
          this.getStudentList(true);
        }, 500);
        this.generateBulkRegisterResponse(res);
        this.strictLoader = false;
        setTimeout(() => {
          this.progress = 1;
          this.showProgress = false;
        }, 2000);
      }, (error) => {
        console.log("error", error);
        this.bulkRegRes = error;
        // this.generateBulkRegisterResponse(res);
        this.toastMsg.error('', this.generalService.translateString('ERROR_WHILE_IMPORTING_DATA'));
        this.strictLoader = false;
        this.showProgress = false;
      });
  }

  generateBulkRegisterResponse(response: any) {
    this.bulkRegRes = response.reduce((prev, current) => {
      const currentCSV = current.result.map((item: any) => {
        return {
          ...item.studentDetails,
          status: item.status,
          error: item.status ? '' : item.error
        }
      });
      return {
        success_count: prev.success_count + current.success_count,
        error_count: prev.error_count + current.error_count,
        duplicate_count: prev.duplicate_count + current.duplicate_count,
        csv: prev.csv.concat(currentCSV)
      }
    }, {
      success_count: 0,
      error_count: 0,
      duplicate_count: 0,
      csv: []
    });
    this.downloadResModalRef = this.openModal(this.downloadResModal);
  }

  generateBulkIssueCredentialResponse(response: any) {
    this.bulkIssuedCredRes = response.reduce((prev, current) => {
      const currentCSV = current.result.map((item: any) => {
        return {
          ...item.credentialSubject,
          status: item.status,
          error: item.status ? '' : item.error
        }
      });
      return {
        success_count: prev.success_count + current.success_count,
        error_count: prev.error_count + current.error_count,
        csv: prev.csv.concat(currentCSV)
      }
    }, {
      success_count: 0,
      error_count: 0,
      csv: []
    });
    this.downloadIssuedResModalRef = this.openModal(this.downloadIssuedResModal);
  }

  importData(list: any[]) {
    const request: RequestParam = {
      url: `${this.baseUrl}/v1/credentials/upload/${this.model.certificateType}`,
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
    const request: RequestParam = {
      url: `${this.baseUrl}/v1/sso/student/bulk/register`,
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

  getStudentList(verifyAadhar: boolean = false) {
    this.studentList = [];
    this.isLoading = true;
    const request = {
      url: `${this.baseUrl}/v1/sso/student/list`,
      data: {
        "grade": this.model.grade,
        "acdemic_year": this.model.academicYear,
        "aadhaar_status": "all"
      }
    }
    this.dataService.post(request).subscribe((res: any) => {
      this.isLoading = false;
      this.strictLoader = false;
      if (res?.result?.length) {
        this.allStudents = res.result;
        this.studentList = res.result.map((item: any) => {
          return {
            did: item.student.DID,
            studentId: item.student.student_id,
            name: item.student.student_name,
            dob: item.student.dob,
            mobile: item.studentdetail.mobile,
            guardian: item.studentdetail.gaurdian_name,
            osid: item.studentdetail.osid,
            isVerified: item.student.aadhaar_status === 'verified'
          }
        });

        if (verifyAadhar) {
          this.verifyStudentsAadhar();
        }
        this.pageChange();
      }
    }, (error: any) => {
      this.isLoading = false;
      this.strictLoader = false;
      this.toastMsg.error("", this.generalService.translateString('ERROR_WHILE_FETCHING_STUDENT_LIST'));
    });
  }

  openDeclarationModal() {
    this.declarationModalRef = this.openModal(this.declarationModal, 'md');
  }

  openModal(content: TemplateRef<any>, size = 'sm') {
    const options: NgbModalOptions = {
      // backdrop: 'static',
      animation: true,
      centered: true,
      size
    }
    return this.modalService.open(content, options);
  }

  submitDeclarationForm(isConfirmed: boolean) {
    this.declarationModalRef.close();

    if (isConfirmed) {
      this.issueBatchCredential();
    }
  }

  verifyStudent(student: any) {
    const user = this.allStudents.find((item => item.studentdetail.osid === student.osid));

    if (user) {
      this.strictLoader = true;
      this.credentialService.verifyAadhar({ studentData: user.student }).subscribe((res: any) => {
        this.strictLoader = false;
        this.toastMsg.success("", this.generalService.translateString('AADHAAR_VERIFIED_SUCCESSFULLY'));
        this.getStudentList();
      }, error => {
        this.strictLoader = false;
        this.toastMsg.error("", this.generalService.translateString('ERROR_WHILE_VERIFYING_AADHAAR'));
      });
    }
  }

  verifyStudentsAadhar() {
    this.strictLoader = true;
    const pendingVerification = this.allStudents.filter(item => item?.student?.aadhaar_status === '');
    forkJoin(
      pendingVerification.map((item: any) => {
        return this.credentialService.verifyAadhar({ studentData: item.student }).pipe(catchError(error => of(error)))
      })).subscribe((res: any) => {
        console.log("Result", res);
        this.strictLoader = false;
        this.toastMsg.success("", this.generalService.translateString('AADHAAR_VERIFIED_SUCCESSFULLY'));
        setTimeout(() => {
          this.getStudentList();
        }, 500);
      }, error => {
        this.strictLoader = false;
        this.toastMsg.error("", this.generalService.translateString('ERROR_WHILE_VERIFYING_AADHAAR'));
      });
  }

  issueBatchCredential() {
    const verifiedList = this.studentList.filter(item => item.isVerified);
    const studentBatches = _.chunk(verifiedList, BATCH_LIMIT);
    this.strictLoader = true;
    this.showProgress = true;
    this.progress = 0;
    this.currentBatch = 0;
    this.totalBatches = studentBatches.length;

    this.bulkRegRes = {};
    from(studentBatches)
      .pipe(
        concatMap((data: any[]) => {
          return this.issueBulkCredentials(data)
        }),
        tap((response) => {
          console.log(response);
          this.currentBatch++;
          this.progress = Math.ceil((this.currentBatch / this.totalBatches) * 100);
        }),
        toArray()
      ).subscribe((res) => {
        setTimeout(() => {
          this.getStudentList();
        }, 100);
        this.strictLoader = false;
        setTimeout(() => {
          this.progress = 1;
          this.showProgress = false;
        }, 2000);
        this.generateBulkIssueCredentialResponse(res);
        this.toastMsg.success("", this.generalService.translateString('CREDENTIAL_ISSUED_SUCCESSFULLY'));
      }, (error: any) => {
        this.strictLoader = false;
        this.showProgress = false;
        this.progress = 1;
        this.toastMsg.error("", this.generalService.translateString('ERROR_WHILE_ISSUING_CREDENTIALS'));
      });
  }

  private issueBulkCredentials(studentList: any[]) {
    this.strictLoader = true;
    this.bulkIssuedCredRes = {};
    const date = new Date();
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    const request = {
      url: `${this.baseUrl}/v1/sso/student/bulk/credentials`,
      data: {
        "credentialSubjectCommon": {
          "grade": this.model.grade,
          "academicYear": this.model.academicYear
        },
        "credentialSubject": studentList.map((item: any) => {
          return {
            "id": item.did,
            "enrolledOn": date.toISOString(),
            "studentName": item.name,
            "student_id": item?.studentId,
            "school_id": this.authService.schoolDetails?.udiseCode,
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

    return this.dataService.post(request);
  }

  downloadBulkRegisterResponse() {
    this.downloadResModalRef.close();
    const csv = Papa.unparse(this.bulkRegRes.csv);
    this.utilService.downloadFile(`${this.model.grade}-registration-report.csv`, 'text/csv;charset=utf-8;', csv);
  }

  downloadIssuedCredResponse() {
    this.downloadIssuedResModalRef.close();
    const csv = Papa.unparse(this.bulkIssuedCredRes.csv);
    this.utilService.downloadFile(`${this.model.grade}-credentials-report.csv`, 'text/csv;charset=utf-8;', csv);
  }


  editStudent(student: any) {
    console.log("student", student);
    this.editStudentForm.patchValue({
      studentName: student.studentName,
      studentId: student.student_id,
      dob: student.dob,
      guardianName: student.gaurdian_name,
      aadharNumber: student.aadhar_token,
      mobile: student.mobile
    });
    this.selectedStudent = student;
    this.editFormModalRef = this.openModal(this.editFormModal);
  }

  onUpdate() {
    if (this.editStudentForm.valid) {
      const payload = {
        studentNewData: {
          studentName: this.editStudentForm.value.studentName,
          student_id: this.editStudentForm.value.studentId,
          dob: this.editStudentForm.value.dob,
          gaurdian_name: this.editStudentForm.value.guardianName,
          aadhar_token: this.editStudentForm.value.aadharNumber,
          mobile: this.editStudentForm.value.mobile
        },
        osid: this.selectedStudent.osid
      }
      const aadharVerifyPayload = {
        "studentData": {
          "student_name": this.editStudentForm.value.studentName
        }
      }
      this.credentialService.updateStudent(payload)
        .pipe(concatMap(_ => this.credentialService.verifyAadhar(aadharVerifyPayload)))
        .subscribe((res: any) => {
          console.log("res", res);
          //call new student list call
        })
    } else {
      console.error("Invalid Form");
    }

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

