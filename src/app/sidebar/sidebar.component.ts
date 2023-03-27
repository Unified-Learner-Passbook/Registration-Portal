import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
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
      class: 'fa fa-user-check',
      isActive: true,
    },
    {
      label: this.generalService.translateString('ADD_ISSUER_STAFF'),
      link: '',
      class: 'fa fa-graduation-cap',
      isActive: false,
    },
    {
      label: this.generalService.translateString('ISSUED_CREDENTIAL'),
      link: 'issued-credential',
      class: 'fa fa-calendar-check',
      isActive: false,
    },
    {
      label: this.generalService.translateString('ACCOUNT'),
      link: 'my-account',
      class: 'fa fa-user',
      isActive: false,
    },
    {
      label: this.generalService.translateString('SETTINGS'),
      link: '',
      class: 'fa fa-cog',
      isActive: false,
    },
  ];

  showInstructions = false;
  constructor(
    private readonly generalService: GeneralService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.getRouteData();
  }

  logout() {
    this.authService.doLogout();
  }

  getRouteData() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showInstructions  = event.url === '/register-entity';
      });
  }
}
