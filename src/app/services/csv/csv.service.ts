import { Injectable } from '@angular/core';
import { GeneralService } from '../general/general.service';
import * as Papa from "papaparse";
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

  constructor(private generalService: GeneralService) { }

  /**
   * Fetch Schema for CSV template
   */
  getTemplateSchema(id: string) {
    if (id.length < 1) {
      throwError(() => new Error('Id is missing'));
    }

    return this.generalService.getData(`http://64.227.185.154:3001/schema/jsonld?id=${id}`, true);
  }

  downloadCSVTemplate(csvContent: string, fileName: string = 'template.csv') {
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

    return Papa.unparse({ data, fields: columns });
  }
}
