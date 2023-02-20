import { Component, OnInit } from '@angular/core';
import Papa from "papaparse";
import { DataService } from '../services/data/data-request.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import * as _ from 'lodash-es'
import { concatMap, tap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';
@Component({
  selector: 'app-register-entity',
  templateUrl: './register-entity.component.html',
  styleUrls: ['./register-entity.component.scss']
})
export class RegisterEntityComponent implements OnInit {
  tableColumns: string[] = [];
  tableRows: any[] = [];
  allDataRows: any[] = [];
  parsedCSV: any[] = []
  grades = [
    {
      label: '1st',
      value: 'class-1'
    },
    {
      label: '2nd',
      value: 'class-2'
    },
    {
      label: '3rd',
      value: 'class-3'
    },
    {
      label: '4th',
      value: 'class-4'
    },
    {
      label: '5th',
      value: 'class-5'
    },
    {
      label: '6th',
      value: 'class-6'
    },
    {
      label: '7th',
      value: 'class-7'
    },
    {
      label: '8th',
      value: 'class-8'
    },
    {
      label: '9th',
      value: 'class-9'
    },
    {
      label: '10th',
      value: 'class-10'
    },
  ];
  certificateTypes = [
    {
      label: 'Proof of Enrollment',
      value: 'ProofOfEnrollment'
    },
    {
      label: 'Proof of Assessment',
      value: 'ProofOfAssessment'
    },
    {
      label: 'Proof of Benefits',
      value: 'ProofOfBenefits'
    }
  ]
  startYear = 2000;
  currentYear = new Date().getFullYear();
  academicYearRange: string[] = [];
  model: any = {};
  isLoading = false;
  showProgress = false;
  progress = 0;
  currentBatch = 0;
  totalBatches: number;

  page = 1;
  pageSize = 30;

  errorMessage: string;
  constructor(private dataService: DataService, private toastMsg: ToastMessageService) { }

  ngOnInit(): void {
    this.setAcademicYear();
  }

  setAcademicYear() {
    for (let fromYear = this.startYear; fromYear < this.currentYear; fromYear++) {
      // const toYear = (fromYear + 1).toString().substring(2);
      this.academicYearRange.push(`${fromYear}-${fromYear + 1}`);
    }
  }

  downloadTemplate() {
    let link = document.createElement("a");
    link.setAttribute('type', 'hidden');
    link.download = "registration-template";
    link.href = "assets/template/registration-template.csv";
    link.click();
    link.remove();
  }

  resetTableData() {
    this.errorMessage = '';
    this.tableColumns = [];
    this.tableRows = [];
    this.allDataRows = [];
  }

  public async importDataFromCSV(event: any) {
    try {
      this.resetTableData();
      this.parsedCSV = await this.parseCSVFile(event);
      const columns = Object.keys(this.parsedCSV[0]);
      this.tableColumns = columns.map((header: string) => header.replace(/_/g, " ").trim());
      this.allDataRows = this.parsedCSV.map(item => Object.values(item));
      this.pageChange();
    } catch (error) {
      this.errorMessage = error?.message ? error.message : "Error while parsing CSV file";
      console.warn("Error while parsing csv file", error);
    }
  }

  parseCSVFile(inputValue): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(inputValue.target.files[0], {
        header: true,
        skipEmptyLines: true,
        error: (err) => {
          console.warn("Error while parsing CSV file", err);
          reject(err);
        },
        complete: (results) => {
          if (results?.errors?.length) {
            reject(results.errors[0]);
          } else {
            resolve(results.data);
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
        resolve(fileString);
      };

      myReader.onerror = (e) => {
        reject(e);
      }

      myReader.onprogress = (e) => {
        console.info("progress", e)
      }
    });
  }

  pageChange() {
    this.tableRows = this.allDataRows.map((row, i) => row).slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  saveAndVerify() {
    console.log("parsedCSV", this.parsedCSV);
    console.log("model", this.model);

    const dataBatches = _.chunk(this.parsedCSV, 20);
    console.log("dataBatches", dataBatches);
    this.isLoading = true;
    this.showProgress = true;
    this.progress = 0;
    this.totalBatches = dataBatches.length;

    from(dataBatches)
      .pipe(
        concatMap((data: any[]) => {
          return this.importData(data)
        }),
        tap((response) => {
          console.log(response);
          this.currentBatch++;
          this.progress = Math.ceil((this.currentBatch / this.totalBatches) * 100);
        }),
        toArray()
      ).subscribe((res) => {
        console.log("final", res);
        this.toastMsg.success('', 'Students data imported successfully!');
        this.resetTableData();
        this.isLoading = false;
        setTimeout(() => {
          this.progress = 0;
          this.showProgress = false;
        }, 2000);
      }, (error) => {
        console.log("error", error);
        this.toastMsg.error('', 'Error while importing data');
        this.isLoading = false;
      });
  }

  importData(list: any[]) {
    const request = {
      url: 'https://ulp.uniteframework.io/middleware/v1/credentials/data-import',
      data: {
        schoolId: "09270809901",
        grade: this.model.grade,
        academic_year: this.model.academicYear,
        type: this.model.certificateType,
        studentData: list
      }
    }
    return this.dataService.post(request);
  }
}

