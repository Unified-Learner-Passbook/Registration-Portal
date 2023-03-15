import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../services/general/general.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  featureList = [
    'Issue academic certificates ',
    'Empower students to connect to opportunities',
    'Have a wholesome view of student performance'
  ]
  constructor(private generalService: GeneralService) { }

  ngOnInit(): void {
  }

  openSSO() {
    this.generalService.getData('https://ulp.uniteframework.io/ulp-bff/v1/sso/digilocker/authorize', true).subscribe((res) => {
      console.log("res", res);
      window.open(res.digiauthurl, "_self");
    });
  }

}
