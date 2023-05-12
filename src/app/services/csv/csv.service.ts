import { Injectable } from '@angular/core';
import { GeneralService } from '../general/general.service';
import * as Papa from "papaparse";
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CsvService {
  baseUrl: string;

  constructor(private generalService: GeneralService) {
    this.baseUrl = environment.baseUrl;

  }

  /**
   * Fetch Schema for CSV template
   */
  getTemplateSchema(id: string) {
    if (id.length < 1) {
      throwError(() => new Error('Id is missing'));
    }

    return this.generalService.getData(`${this.baseUrl}/v1/sso/student/credentials/schema/json/${id}`, true);
    // return this.generalService.getData(`https://ulp.uniteframework.io/cred-schema/schema/jsonld?id=${id}`, true);
  }

  downloadCSVTemplate(csvContent: string, fileName: string = 'template.csv') { //TODO use util service
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generateCSV(columns: string[], data = [], fileName: string = 'template.csv') {
    if (columns.length < 1) {
      return;
    }

    return Papa.unparse({ data, fields: columns }, { quotes: true });
  }
}
