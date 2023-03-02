import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general/general.service';


@Component({
  selector: 'app-global-header',
  templateUrl: './global-header.component.html',
  styleUrls: ['./global-header.component.scss']
})
export class GlobalHeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
