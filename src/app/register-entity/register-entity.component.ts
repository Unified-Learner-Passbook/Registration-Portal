import { Component, OnInit } from '@angular/core';
import Papa from "papaparse";

@Component({
  selector: 'app-register-entity',
  templateUrl: './register-entity.component.html',
  styleUrls: ['./register-entity.component.scss']
})
export class RegisterEntityComponent implements OnInit {
  tableColumns: string[] = [];
  tableRows: any[] = [];
  allDataRows: any[] = [];
  grades = [
    {
      label: '1st',
      value: 1
    },
    {
      label: '2nd',
      value: 2
    },
    {
      label: '3rd',
      value: 3
    },
    {
      label: '4th',
      value: 4
    }
  ];
  startYear = 2000;
  currentYear = new Date().getFullYear();
  academicYearRange: string[] = [];

  page = 1;
  pageSize = 30;

  errorMessage: string;
  constructor() { }

  ngOnInit(): void {
    this.setAcademicYear();
  }

  setAcademicYear() {
    for (let fromYear = this.startYear; fromYear < this.currentYear; fromYear++) {
      const toYear = (fromYear + 1).toString().substring(2);
      this.academicYearRange.push(`${fromYear} - ${toYear}`);
    }
  }

  downloadTemplate() {
    let link = document.createElement("a");
    link.setAttribute('type', 'hidden');
    link.download = "registration-template";
    link.href = "assets/registration-template.csv";
    link.click();
    link.remove();
  }

  public async importDataFromCSV(event: any) {
    try {
      this.errorMessage = '';
      let csvText: string = await this.getTextFromFile(event);
      const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      console.log("parsedData", parsedData);
      
      if (parsedData.errors.length) {
        console.warn("Error while parsing CSV file", parsedData.errors);
        this.errorMessage = parsedData.errors[0]?.message;
        return;
      }

      const columns = csvText.slice(0, csvText.indexOf('\n')).split(',');
      this.tableColumns = columns.map((item) => item.replace(/_/g, " ").trim());

      const rows = csvText.slice(csvText.indexOf('\n') + 1).split('\n');
      this.allDataRows = rows.map((row: string) => row.split(','));

      this.pageChange();
      console.log("tableRows", this.allDataRows);
      console.log("tableColumns", this.tableColumns);
    } catch (error) {
      this.errorMessage = "Error while parsing CSV file";
      console.warn("Error while parsing csv file", error);
    }
  }

  parseCSVFile(inputValue) {
    return new Promise((resolve, reject) => {
      Papa.parse(inputValue.target.files[0], {
        header: true,
        skipEmptyLines: true,
        error: (err) => {
          console.warn("Error while parsing CSV file", err);
          reject(err);
        },
        complete: (results) => {
          console.log("results", results);

          if (results.errors.length) {
            reject(results.errors[0]);
          } else {
            resolve(results);
          }
        }
      });
    });
  }

  private getTextFromFile(inputValue: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const file: File = inputValue.target.files[0];
      const myReader: FileReader = new FileReader();
      myReader.readAsText(file);

      myReader.onloadend = (e) => {
        // console.log(myReader.result);
        let fileString: string = myReader.result as string;
        resolve(fileString)
      };

      myReader.onerror = (e) => {
        reject(e)
      }

      myReader.onprogress = (e) => {
        console.log("progress", e)
      }
    });
  }

  pageChange() {
    this.tableRows = this.allDataRows.map((row, i) => row).slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }
}

