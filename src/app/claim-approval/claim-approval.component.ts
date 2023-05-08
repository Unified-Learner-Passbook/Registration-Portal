import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { UtilService } from '../services/util/util.service';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

@Component({
  selector: 'app-claim-approval',
  templateUrl: './claim-approval.component.html',
  styleUrls: ['./claim-approval.component.scss']
})
export class ClaimApprovalComponent implements OnInit {
  studentDetails = []
  tableRows: any[] = [];
  isApproveConfirmed = false;
  userConsent = false;
  isLoading = false;
  consentModalRef: NgbModalRef;
  selectedUser: any;
  modelRef: any;
  rejectModelRef: any;
  isPendingClaims = false;
  statusValues = [
    {
      label: this.generalService.translateString('PENDING'),
      value: "pending"
    },
    {
      label: this.generalService.translateString('APPROVED'),
      value: "approved"
    },
    {
      label: this.generalService.translateString('REJECTED'),
      value: "rejected"
    },
    {
      label: this.generalService.translateString('ISSUED'),
      value: "issued"
    }
  ]
  model: any = {
    status: 'pending'
  }

  page = 1;
  pageSize = 20;

  @ViewChild('approveModal') approveModal: TemplateRef<any>
  @ViewChild('rejectModal') rejectModal: TemplateRef<any>


  constructor(
    private readonly generalService: GeneralService,
    private readonly toastService: ToastMessageService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly utilService: UtilService
  ) { }

  ngOnInit(): void {
    this.getStudentDetail();
  }

  getStudentDetail(claimStatus = "pending") {
    this.isPendingClaims = claimStatus === "pending";
    console.log("getStudentDetail", this.authService.schoolDetails.udiseCode)
    const search = {
      "filters": {
        "claim_status": {
          "eq": claimStatus
        },
        "school_udise": {
          "eq": this.authService.schoolDetails?.udiseCode
        }
      }
    }
    this.isLoading = true;
    this.studentDetails = [];
    this.tableRows = [];
    this.page = 1;
    this.generalService.postStudentData('/studentDetail', search).subscribe((res) => {

      console.log('studentDetail list', res.result);
      this.studentDetails = res.result.map((item: any) => {
        item.osCreatedAt = this.generalService.getDaysDifference(item.osCreatedAt);

        if (item.enrollon) {
          if (dayjs(item.enrollon).isValid()) {
            item.enrollon = dayjs(item.enrollon).format();
          } else if (dayjs(item.enrollon, 'MM/YYYY').isValid()) {
            item.enrollon = dayjs(item.enrollon, 'MM/YYYY').format();
          } else if (dayjs(item.enrollon, 'DD-MM-YYYY').isValid()) {
            item.enrollon = dayjs(item.enrollon, 'DD-MM-YYYY').format();
          } else {
            item.enrollon = '';
          }
        }
        return item;
      });

      if (this.isPendingClaims && this.studentDetails.length) {
        this.generalService.setPendingRequestCount(this.studentDetails.length);
      }
      this.pageChange();
      this.isLoading = false;
    }, (err) => {
      this.toastService.error('', this.utilService.translateString('ERROR_WHILE_FETCHING_STUDENT_LIST'));
      this.isLoading = false;
      console.log('error', err);
    });
  }

  approveStudent(user) {
    const date = new Date();
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1))

    const payload = {
      "issuer": this.authService.schoolDetails?.did,
      "vcData": {
        "issuanceDate": date.toISOString(),
        "expirationDate": nextYear.toISOString()
      },
      "credentialSubject": {
        "mobile": user.mobile,
        "guardian_name": user.gaurdian_name,
        "school_name": user.school_name,
        "grade": user.grade,
        "academic_year": user.acdemic_year,
        "osid": user.osid,
        "student_id": user.student.student_id,
        "student_name": user.student.student_name,
        "dob": user.student.dob,
        "aadhar_token": user.student.aadhar_token,
        "reference_id": user.student.reference_id,
        "student_osid": user.student_id,
        "school_id": this.authService.schoolDetails?.udiseCode,
        "enrollon": user.enrollon
      }

    }
    this.generalService.approveStudentData(payload).subscribe((res) => {
      console.log('approveStudent', res);
      //this.studentDetails = this.studentDetails.filter(())
      if (res.success == true) {
        // telemetry cliam approval
        this.raiseInteractEvent('claim-approval')
        this.toastService.success('', res.message)
        this.studentDetails = this.studentDetails.filter(item => item.osid !== user.osid);
        this.generalService.setPendingRequestCount(this.studentDetails.length);
        this.pageChange();
        console.log("61", this.studentDetails.length)
      } else {
        this.toastService.error('', res.message)
      }
    }, (err) => {
      console.log('approveStudent error', err)
    });
  }

  rejectStudent(user) {
    const payload = {
      "issuer": this.authService.schoolDetails?.did,
      "credentialSubject": {
        "mobile": user.mobile,
        "guardian_name": user.gaurdian_name,
        "school_name": user.school_name,
        "grade": user.grade,
        "academic_year": user.acdemic_year,
        "osid": user.osid,
        "student_id": user.student.student_id,
        "student_name": user.student.student_name,
        "dob": user.student.dob,
        "aadhar_token": user.student.aadhar_token,
        "reference_id": user.student.reference_id,
        "student_osid": user.student_id,
      }
    }

    this.generalService.rejectStudentData(payload).subscribe((res) => {
      console.log('approveStudent', res);
      if (res.success) {
        this.toastService.success('', res.message)
        this.studentDetails = this.studentDetails.filter(item => item.osid !== user.osid);
        this.pageChange();
        console.log("61", this.studentDetails.length);
        this.generalService.setPendingRequestCount(this.studentDetails.length);
      } else {
        this.toastService.error('', res.message)
      }

    }, (err) => {
      // this.toastMsg.error('error', err.error.params.errmsg)
      console.log('rejectStudent error', err)
    });
  }

  openPopup(user) {
    this.selectedUser = user;
    this.modelRef = this.modalService.open(this.approveModal)
  }

  approveConfirm(isConfirmed: boolean) {
    this.isApproveConfirmed = isConfirmed;
    this.userConsent = isConfirmed;
    this.modelRef.close()

    if (isConfirmed) {
      this.approveStudent(this.selectedUser);
    }
  }

  onModelChange() {
    this.getStudentDetail(this.model.status)
  }

  rejectPopup(user) {
    this.selectedUser = user;
    this.rejectModelRef = this.modalService.open(this.rejectModal)
  }

  rejectConfirm(isConfirmed: boolean) {
    console.log("rejectConfirm")
    this.isApproveConfirmed = isConfirmed;
    this.userConsent = isConfirmed;
    this.rejectModelRef.close()

    if (isConfirmed) {
      this.rejectStudent(this.selectedUser);
    }
  }

  pageChange() {
    this.tableRows = this.studentDetails.map((row, i) => row).slice(
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
