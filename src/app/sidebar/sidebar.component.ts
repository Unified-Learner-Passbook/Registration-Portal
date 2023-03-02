import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  menuList = [
    {
      label: 'Register Students',
      link: 'register-entity',
      class: 'fa fa-home',
      isActive: true
    }, 
    {
      label: 'Add Issuer Staff',
      link: '',
      class: 'fa fa-graduation-cap',
      isActive: false
    }, 
    {
      label: 'Issued Credential',
      link: 'issue-credential',
      class: 'fa fa-calendar-check',
      isActive: false
    }, 
    {
      label: 'Settings',
      link: '',
      class: 'fa fa-cog',
      isActive: false
    }, 
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
