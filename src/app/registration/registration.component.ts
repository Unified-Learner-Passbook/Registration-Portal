import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth/auth.service';
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
  constructor(
    private readonly generalService: GeneralService,
    private readonly authService: AuthService,
    private readonly router: Router
    ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }

  }

  openSSO() {
    this.generalService.getData('https://ulp.uniteframework.io/ulp-bff/v1/sso/digilocker/authorize/portal', true).subscribe((res) => {
      console.log("res", res);
      window.open(res.digiauthurl, "_self");
    });
  }

}
