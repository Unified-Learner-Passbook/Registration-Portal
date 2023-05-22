import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth/auth.service';
import { GeneralService } from '../services/general/general.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  baseUrl: string;


  featureList = [
    'Issue academic certificates ',
    'Empower students to connect to opportunities',
    'Have a wholesome view of student performance'
  ]
  constructor(
    private readonly generalService: GeneralService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly toastMessageService: ToastMessageService
  ) {
    this.baseUrl = environment.baseUrl;

  }
  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

      var href = $(e.target).attr('href');
      var $curr = $(".process-model  a[href='" + href + "']").parent();

      $('.process-model li').removeClass();

      $curr.addClass("active");
      $curr.prevAll().addClass("visited");
  });
 
  }
  ngAfterViewInit(): void {
   
  }

}
