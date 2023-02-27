import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss']
})
export class MainDashboardComponent implements OnInit, OnDestroy {

  isChildRoute = false;
  private unsubscribe$ = new Subject<void>();
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    this.router.events.pipe(
      takeUntil(this.unsubscribe$),
      filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isChildRoute = !!this.activatedRoute.children.length;
      });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
