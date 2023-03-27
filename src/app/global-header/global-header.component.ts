import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../services/general/general.service';

@Component({
  selector: 'app-global-header',
  templateUrl: './global-header.component.html',
  styleUrls: ['./global-header.component.scss']
})
export class GlobalHeaderComponent implements OnInit {

  languages = [];
  selectedLanguage = ''
  constructor(
    private readonly generalService: GeneralService
  ) { }

  ngOnInit(): void {
    this.getAllLanguages();
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
}
