import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';

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
  pageSize = 10;

  @ViewChild('approveModal') approveModal: TemplateRef<any>
  @ViewChild('rejectModal') rejectModal: TemplateRef<any>


  constructor(
    private readonly generalService: GeneralService,
    private readonly toastService: ToastMessageService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService
  ) { }

  ngOnInit(): void {
    this.getStudentDetail()
  }

  getStudentDetail(claimStatus = "pending") {
    const search = {
      "filters": {
        "claim_status": {
          "eq": claimStatus
        },
        "school_udise": {
          "eq": this.authService.schoolDetails?.schoolUdise
        }
      }
    }
    this.isLoading = true;
    this.studentDetails = [];
    this.tableRows = [];
    this.page = 1;
    this.generalService.postStudentData('/studentDetail', search).subscribe((res) => {

      console.log('studentDetail length', res.result.length);
      console.log('studentDetail list', res.result);
      this.studentDetails = res.result.map((item: any) => {
        return { ...item, osCreatedAt: this.generalService.getDaysDifference(item.osCreatedAt) }
      });
      this.pageChange();
      this.isLoading = false;
    }, (err) => {
      this.toastService.error('', 'Error while fetching data');
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
        //studentDetail:
        "mobile": user.mobile,
        "guardian_name": user.gaurdian_name,
        "school_name": user.school_name,
        "grade": user.grade,
        "academic_year": user.acdemic_year,
        "osid": user.osid,
        //student
        "student_id": user.student.student_id,
        "student_name": user.student.student_name,
        "dob": user.student.dob,
        "aadhar_token": user.student.aadhar_token,
        "reference_id": user.student.reference_id,
        "student_osid": user.student_id,
      }

    }
    this.generalService.approveStudentData('/studentDetailV2', payload).subscribe((res) => {
      console.log('approveStudent', res);
      //this.studentDetails = this.studentDetails.filter(())
      if (res.success == true) {
        this.toastService.success('', res.message)
        this.studentDetails = this.studentDetails.filter(item => item.osid !== user.osid);
        this.pageChange();
        console.log("61", this.studentDetails.length)
      } else {
        this.toastService.error('', res.message)
      }

    }, (err) => {
      // this.toastMsg.error('error', err.error.params.errmsg)
      console.log('approveStudent error', err)
    });
  }

  rejectStudent(user) {
    const payload = {
      "issuer": this.authService.schoolDetails?.did,
      "credentialSubject": {
        //studentDetail:
        "mobile": user.mobile,
        "guardian_name": user.gaurdian_name,
        "school_name": user.school_name,
        "grade": user.grade,
        "academic_year": user.acdemic_year,
        "osid": user.osid,
        //student
        "student_id": user.student.student_id,
        "student_name": user.student.student_name,
        "dob": user.student.dob,
        "aadhar_token": user.student.aadhar_token,
        "reference_id": user.student.reference_id,
        "student_osid": user.student_id,
      }

    }
    this.generalService.rejectStudentData('/studentDetailV2', payload).subscribe((res) => {
      console.log('approveStudent', res);
      //this.studentDetails = this.studentDetails.filter(())
      if (res.success == true) {
        this.toastService.success('', res.message)
        this.studentDetails = this.studentDetails.filter(item => item.osid !== user.osid);
        console.log("61", this.studentDetails.length)
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
