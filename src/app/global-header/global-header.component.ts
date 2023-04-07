import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { GeneralService } from '../services/general/general.service';

const ONE_HOUR = 1 * 60 * 60 * 1000; //3600000 seconds

@Component({
  selector: 'app-global-header',
  templateUrl: './global-header.component.html',
  styleUrls: ['./global-header.component.scss']
})
export class GlobalHeaderComponent implements OnInit {

  languages = [];
  selectedLanguage = '';
  isClaimsPending = false;
  constructor(
    private readonly generalService: GeneralService
  ) { }

  ngOnInit(): void {
    this.getAllLanguages();
    this.checkNewClaims();
  }

  getAllLanguages() {
    const languages = localStorage.getItem('languages');
    const selectedLang = localStorage.getItem('setLanguage');
    if (languages) {
      this.languages = JSON.parse(languages);
    }

    if (selectedLang) {
      this.selectedLanguage = selectedLang;
    }
  }

  changeLanguage() {
    this.generalService.setLanguage(this.selectedLanguage);
  }

  checkNewClaims() {
    const search = {
      "filters": {
        "claim_status": {
          "eq": 'pending'
        }
      }
    }

    interval(ONE_HOUR)
      .pipe(
        mergeMap(() => this.generalService.postStudentData('/studentDetail', search))
      ).subscribe((res) => {
        this.isClaimsPending = !!res.length;
      }, error => this.isClaimsPending = false);
  }
}
