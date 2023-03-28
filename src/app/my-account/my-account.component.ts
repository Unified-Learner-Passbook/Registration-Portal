import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { CredentialService } from '../services/credential/credential.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  currentUser: any;
  credentials$: any;
  constructor(
    private readonly authService: AuthService,
    private readonly credentialService: CredentialService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.credentials$ = this.credentialService.getAllCredentials();
  }

  renderCertificate(credential: any) {
    const navigationExtras: NavigationExtras = {
      state: credential
    };
    this.router.navigate(['/dashboard/doc-view'], navigationExtras);
  }

}
