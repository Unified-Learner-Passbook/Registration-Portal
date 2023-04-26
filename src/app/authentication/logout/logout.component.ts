import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AppConfig } from 'src/app/app.config';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  baseUrl = this.config.getEnv('baseUrl');
  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly config: AppConfig,
    private readonly router: Router,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    localStorage.clear();
    this.authService.doLogout();
    // this.keycloakService.clearToken();
    // this.keycloakService.logout(window.location.origin);
    // this.router.navigate([''])
  }

}
