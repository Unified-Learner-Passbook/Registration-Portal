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
      image: 'assets/icons/home.svg',
      isActive: true
    }, 
    {
      label: 'Add Issuer Staff',
      link: '',
      image: 'assets/icons/degree.svg',
      isActive: false
    }, 
    {
      label: 'Issue Credentials',
      link: 'issue-credentials',
      image: 'assets/icons/calendar.svg',
      isActive: false
    }, 
    {
      label: 'Settings',
      link: '',
      image: 'assets/icons/gear.svg',
      isActive: false
    }, 
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
