import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../services/general/general.service';

@Component({
  selector: 'app-claim-approval',
  templateUrl: './claim-approval.component.html',
  styleUrls: ['./claim-approval.component.scss']
})
export class ClaimApprovalComponent implements OnInit {
  public studentDetails = [];

  constructor(public generalService: GeneralService) { }

  ngOnInit(): void {
    var search = {
      "filters": {}
    }
    this.generalService.postStudentData('/studentDetail', search).subscribe((res) => {
      console.log('studentDetail', res);
      this.studentDetails = res.result;
      console.log("this.studentDetails", this.studentDetails)
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
        "status": "Active",
        "osid": user.osid
      }

    }
    this.generalService.approveStudentData('/studentDetail', payload).subscribe((res) => {
      console.log('approveStudent', res);
      //this.studentDetails = this.studentDetails.filter(())

    }, (err) => {
      // this.toastMsg.error('error', err.error.params.errmsg)
      console.log('approveStudent error', err)
    });
  }

  

}
