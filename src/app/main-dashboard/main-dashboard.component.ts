import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { DataService } from '../services/data/data-request.service';
@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss']
})
export class MainDashboardComponent implements OnInit, OnDestroy {

  isChildRoute = false;
  isFirstTimeLogin = false;
  currentUser: any;
  metrics: any;
  private unsubscribe$ = new Subject<void>();
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly dataService: DataService
  ) {
    this.router.events.pipe(
      takeUntil(this.unsubscribe$),
      filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isChildRoute = !!this.activatedRoute.children.length;
      });

    const navigation = this.router.getCurrentNavigation();
    this.isFirstTimeLogin = !!navigation?.extras?.state?.isFirstTimeLogin;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.getMetrics();
  }

  getMetrics() {
    const payload = {
      url: 'https://ulp.uniteframework.io/ulp-bff/v1/portal/count',
      data: {
        "countFields": [
          "students_registered",
          "claims_pending",
          "claims_approved",
          "claims_rejected",
          "credentials_issued"
        ]
      }
    }

    this.dataService.post(payload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: any) => {
        if (response.success) {
          this.metrics = response.result;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
