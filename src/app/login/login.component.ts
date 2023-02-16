import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  showMe: boolean = false;
  ngOnInit() {}
  toggleTag() {
    this.showMe = !this.showMe;
  }
}
