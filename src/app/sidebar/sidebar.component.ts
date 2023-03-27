import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  menuList = [
    {
      label: this.generalService.translateString('HOME'),
      link: 'dashboard',
      class: 'fa fa-home',
      isActive: true,
    },
    {
      label: this.generalService.translateString('REGISTER_STUDENT'),
      link: 'register-entity',
      class: 'fa fa-user-plus',
      isActive: true,
    },
    {
      label: this.generalService.translateString('ISSUED_CREDENTIAL'),
      link: 'issued-credential',
      class: 'fa fa-key',
      isActive: false,
    },
    {
      label: this.generalService.translateString('My Profile'),
      link: 'my-account',
      class: 'fa fa-user',
      isActive: false,
    },
    {
      label: this.generalService.translateString('Claim Approval'),
      link: 'claim-approval',
      class: 'fa fa-user-check',
      isActive: false,
    },
    {
      label: this.generalService.translateString('ADD_ISSUER_STAFF'),
      link: '',
      class: 'fa fa-graduation-cap',
      isActive: false,
    },
  ];
  constructor(
    private readonly generalService: GeneralService,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void { }

  logout() {
    this.authService.doLogout();
  }
}
