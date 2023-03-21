import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { element } from 'protractor';
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

  @ViewChild('approveModal') approveModal: TemplateRef<any>

  constructor(public generalService: GeneralService, private toastService: ToastMessageService, private modalService: NgbModal) { }

  ngOnInit(): void {
    var search = {
      "filters": {}
    }
    this.generalService.postStudentData('/studentDetail', search).subscribe((res) => {
      console.log('studentDetail', res);
      console.log('studentDetail length', res.result.length);
      //this.studentDetails = res.result
      for (const iterator of res.result) {
        if(!iterator.did) {
          this.studentDetails.push(iterator)
        }
      }
      console.log("this.studentDetails", this.studentDetails.length)
    }, (err) => {
      // this.toastMsg.error('error', err.error.params.errmsg)
      console.log('error', err)
    });
  }

  approveStudent(user) {
    var payload = {
      "credentialSubject": {
        "studentId": user.studentSchoolID,
        "studentName": user.studentName,
        "mobile": user.phoneNo,
        "email": "",
        "aadhaarId": user.aadhaarID,
        "schoolId": user.schoolID,
        "status": "",
        "osid": user.osid,
        "gaurdianName": user.gaurdianName,
        "grade": user.grade,
        "academicYear": user.academicYear,


      }

    }
    this.generalService.approveStudentData('/studentDetail', payload).subscribe((res) => {
      console.log('approveStudent', res);
      //this.studentDetails = this.studentDetails.filter(())
      if(res.success == true) {
        this.toastService.success('', res.message)
        this.studentDetails = this.studentDetails.filter(item => item.did !== user.did)
        console.log("61", this.studentDetails.length)
      } else {
        this.toastService.error('', res.message)
      }

    }, (err) => {
      // this.toastMsg.error('error', err.error.params.errmsg)
      console.log('approveStudent error', err)
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

  

}
