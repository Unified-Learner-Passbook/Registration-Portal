import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  featureList = [
    'Certificate verification now simplified',
    'View dozens of scholarships',
    'One click apply'
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
