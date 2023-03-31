import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { element } from 'protractor';
import { AuthService } from '../services/auth/auth.service';
import { DataService } from '../services/data/data-request.service';
import { GeneralService } from '../services/general/general.service';
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
  schoolDetails: any;
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


  constructor(public generalService: GeneralService, private toastService: ToastMessageService, private modalService: NgbModal, private authService: AuthService, private dataService: DataService,) { }

  ngOnInit(): void {
    this.getStudentDetail()
    this.schoolDetails = this.authService.schoolDetails;
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
      // this.toastMsg.error('error', err.error.params.errmsg)
      console.log('error', err)
    });
  }

  approveStudent(user) {
    var payload = {
      "issuer": this.schoolDetails.did,
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
      "issuer": this.schoolDetails.did,
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



}
