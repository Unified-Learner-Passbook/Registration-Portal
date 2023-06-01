import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  menuList: any[];

  showInstructions = false;
  constructor(
    private readonly generalService: GeneralService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initialize();
    this.getRouteData();

    if (this.router.url === '/dashboard/register-entity') {
      this.showInstructions = true;
    }

    this.generalService.languageChange.subscribe((res) => {
      this.initialize();
    });

    this.translate.onLangChange.subscribe(_ => {
      this.initialize();
    });
  }

  initialize() {
    this.menuList = [
      {
        label: this.generalService.translateString('HOME'),
        link: '/dashboard',
        class: 'fa fa-home'
      },
      {
        label: this.generalService.translateString('REGISTER_STUDENT'),
        link: '/dashboard/register-entity',
        class: 'fa fa-user-plus'
      },
      {
        label: this.generalService.translateString('ISSUED_CREDENTIAL'),
        link: '/dashboard/issued-credential',
        class: 'fa fa-key'
      },
      {
        label: this.generalService.translateString('CLAIM_APPROVAL'),
        link: '/dashboard/claim-approval',
        class: 'fa fa-user-check'
      },
      {
        label: this.generalService.translateString('ADD_ISSUER_STAFF'),
        link: '',
        class: 'fa fa-graduation-cap disable'
      },
    ];
  }
  

  logout() {
    this.authService.doLogout();
  }

  getRouteData() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showInstructions = event.url === '/dashboard/register-entity';
      });
  }
}
