import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  downloadFile(fileName: string, fileType: string, content: string) {
    const blob = new Blob([content], { type: fileType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }

  getNumberOrdinals(offset: number, limit: number) {
    let suffixes = ['th', 'st', 'nd', 'rd'];
    let numbers = [];
    for (let i = offset; i <= limit; i++) {
      let ordinal = i + (suffixes[i] || suffixes[0]);
      numbers.push(ordinal);
    }

    return numbers;
  }
}
