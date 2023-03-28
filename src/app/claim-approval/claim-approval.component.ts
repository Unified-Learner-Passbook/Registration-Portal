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
    }
  ]
  model: any = {}

  @ViewChild('approveModal') approveModal: TemplateRef<any>
  @ViewChild('rejectModal') rejectModal: TemplateRef<any>
  

  constructor(public generalService: GeneralService, private toastService: ToastMessageService, private modalService: NgbModal, private authService: AuthService, private dataService: DataService,) { }

  ngOnInit(): void {
    this.getStudentDetail()
    
    this.getSchoolDetails();
  }

  getStudentDetail(claim_status="pending") {
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

      // for (const iterator of res.result) {
      //   if(!iterator.did) {
      //     this.studentDetails.push(iterator)
      //   }
      // }
      console.log("this.studentDetails", this.studentDetails.length)
    }, (err) => {
      // this.toastMsg.error('error', err.error.params.errmsg)
      console.log('error', err)
    });
  }

  getSchoolDetails() {
    const udiseId = this.authService.currentUser.schoolUdise;
    console.log("udiseId", udiseId)
    this.dataService.get({ url: `https://ulp.uniteframework.io/ulp-bff/v1/sso/school/${udiseId}` }).subscribe((res: any) => {
      this.schoolDetails = res.result;
      console.log('schoolDetails', this.schoolDetails);
    });
  }

  approveStudent(user) {
    var payload = {
      "issuer": this.schoolDetails.did,
      "credentialSubject": {
        //studentDetail:
        //"student_detail_id": user.student_detail_id,
        "studentId": user.student_id,
        "mobile": user.mobile,
        "guardianName": user.gaurdian_name,
        //"school_udise": user.school_udise,
        "schoolName": user.school_name,
        "grade": user.grade,
        "academicYear": user.acdemic_year,
        //"start_date": user.start_date,
        //"end_date": user.end_date,
        //"claim_status": user.claim_status,
        "osid": user.osid,
        //student
        //"DID": user.student.DID,
        //"reference_id": user.student.reference_id,
        //"aadhar_token": user.student.aadhar_token,
        "studentName": user.student.student_name,
        "dob": user.student.dob,
        //"school_type": user.student.school_type,
        //"meripehchan_id": user.student.meripehchan_id,
        //"username": user.student.username,
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
        //"student_detail_id": user.student_detail_id,
        "studentId": user.student_id,
        "mobile": user.mobile,
        "guardianName": user.gaurdian_name,
        //"school_udise": user.school_udise,
        "schoolName": user.school_name,
        "grade": user.grade,
        "academicYear": user.acdemic_year,
        //"start_date": user.start_date,
        //"end_date": user.end_date,
        //"claim_status": user.claim_status,
        "osid": user.osid,
        //student
        //"DID": user.student.DID,
        //"reference_id": user.student.reference_id,
        //"aadhar_token": user.student.aadhar_token,
        "studentName": user.student.student_name,
        "dob": user.student.dob,
        //"school_type": user.student.school_type,
        //"meripehchan_id": user.student.meripehchan_id,
        //"username": user.student.username,
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
