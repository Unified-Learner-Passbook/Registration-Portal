import { Component, OnInit } from '@angular/core';

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
	pageSize = 4;

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
    let csvText: string = await this.getTextFromFile(event);
    this.tableColumns = csvText.slice(0, csvText.indexOf('\n')).split(',');
    const rows = csvText.slice(csvText.indexOf('\n') + 1).split('\n');
    this.allDataRows = rows.map((row: string) => row.split(','));

    this.pageChange();

    console.log("tableRows", this.allDataRows);
    console.log("tableColumns", this.tableColumns);
  }

  private getTextFromFile(inputValue: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const file: File = inputValue.target.files[0];
      const myReader: FileReader = new FileReader();
      myReader.readAsText(file);

      myReader.onloadend = (e) => {
        console.log(myReader.result);
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
    console.log("rows", this.tableRows);
  }
}

