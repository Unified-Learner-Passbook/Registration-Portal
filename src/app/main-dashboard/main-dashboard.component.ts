import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { DataService } from '../services/data/data-request.service';
import { GeneralService } from '../services/general/general.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { environment } from 'src/environments/environment';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss']
})
export class MainDashboardComponent implements OnInit, OnDestroy {
  baseUrl: string;

  isChildRoute = false;
  isFirstTimeLogin = false;
  currentUser: any;
  metrics: any;
  private unsubscribe$ = new Subject<void>();
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly dataService: DataService,
    private readonly generalService: GeneralService,
    private readonly toastMessageService: ToastMessageService,
    private readonly telemetryService: TelemetryService,
  ) {
    this.baseUrl = environment.baseUrl;

    this.router.events.pipe(
      takeUntil(this.unsubscribe$),
      filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isChildRoute = !!this.activatedRoute.children.length;

        if (!this.isChildRoute) {
          this.getMetrics();
        }
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
      url: `${this.baseUrl}/v1/portal/count`,
      data: {
        "countFields": [
          // "students_registered",
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
      }, error => {
        console.error(error);
        this.toastMessageService.error('', this.generalService.translateString('SOMETHING_WENT_WRONG'));
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    this.raiseImpressionEvent();
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
    const telemetryInteract: IInteractEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        id,
        type,
        subtype,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
      }
    };
    this.telemetryService.interact(telemetryInteract);
  }

  raiseImpressionEvent() {
    const telemetryImpression: IImpressionEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        type: this.activatedRoute.snapshot?.data?.telemetry?.type,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
        uri: this.router.url,
        subtype: this.activatedRoute.snapshot?.data?.telemetry?.subtype,
      }
    };
    this.telemetryService.impression(telemetryImpression);
  }
}
