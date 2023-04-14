import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
    private readonly translateService: TranslateService
  ) { }

  /**
   * Downloads a file with the given file name, content type, and content.
   * @param {string} fileName - The name of the file to download.
   * @param {string} fileType - The content type of the file, e.g. "text/plain" or "image/png".
   * @param {string} content - The content of the file to download.
   */
  downloadFile(fileName: string, fileType: string, content: string) {
    const blob = new Blob([content], { type: fileType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }

  /**
   * Generates an array of number ordinals with suffixes (e.g. '1st', '2nd', '3rd', '4th').
   * @param {number} offset - The starting number for the array.
   * @param {number} limit - The last number for the array.
   * @returns {Array} An array of number ordinals with suffixes.
   */
  getNumberOrdinals(offset: number, limit: number) {
    let suffixes = ['th', 'st', 'nd', 'rd'];
    let numbers = [];
    for (let i = offset; i <= limit; i++) {
      let ordinal = i + (suffixes[i] || suffixes[0]);
      numbers.push(ordinal);
    }

    return numbers;
  }

  /**
   * Translate a string using the application's translation service.
   * @param constant - A string constant to translate.
   * @returns The translated string.
   */
  translateString(constant: string): string {
    return this.translateService.instant(constant);
  }
}
