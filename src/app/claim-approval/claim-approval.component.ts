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
  public studentDetails = []
  isApproveConfirmed = false;
  userConsent = false;
  consentModalRef: NgbModalRef;
  public selectedUser: any;
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

  getStudentDetail(claim_status = "pending") {
    var search = {
      "filters": {
        "claim_status": {
          "eq": claim_status
        }
      }
    }
    this.generalService.postStudentData('/studentDetail', search).subscribe((res) => {

      console.log('studentDetail length', res.result.length);
      console.log('studentDetail list', res.result);
      this.studentDetails = res.result.map((item: any) => {
        return { ...item, osCreatedAt: this.generalService.getDaysDifference(item.osCreatedAt) }
      });

    }, (err) => {
      this.toastService.error('', 'Error while fetching data')
      console.log('error', err);
    });
  }

  approveStudent(user) {
    var payload = {
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
    this.generalService.approveStudentData('/studentDetailV2', payload).subscribe((res) => {
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
      console.log('approveStudent error', err)
    });
  }

  rejectStudent(user) {
    var payload = {
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

  rejcetPopup(user) {
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
