import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general/general.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { SafeUrl } from "@angular/platform-browser";
import { AppConfig } from 'src/app/app.config';


@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.scss']
})
export class PdfViewComponent implements OnInit {
  item: any;
  recordItems: any;
  vcOsid: any;
  headerName: string = 'records'
  //headerName : string = 'issuer';
  newName = "hello";
  documentName: string;
  pdfName: any;
  public data: any;
  sampleData: any;
  schemaContent: any;
  userJson: any;
  templateName: any;
  oldTemplateName: string;
  description: any;
  pdfResponse: any;
  pdfResponse2: any;
  sanitizer: DomSanitizer;
  base64data: any;
  base64String: string;
  imagePath: any;

  constructor(public router: Router, public route: ActivatedRoute, 
    private config: AppConfig,
    public translate: TranslateService, sanitizer: DomSanitizer,
    public generalService: GeneralService, public http: HttpClient) {
    this.sanitizer = sanitizer;
    this.documentName = this.route.snapshot.paramMap.get('document');
    console.log(this.documentName);
    this.vcOsid = this.route.snapshot.paramMap.get('id');
  
  }

  async ngOnInit() {
    this.injectHTML();
  }

  downloadPDF() {
    this.pdfName = this.documentName;
    let headerOptions = new HttpHeaders({
      'template-key': 'html',
      'Accept': 'application/pdf'
    });
    let requestOptions = { headers: headerOptions, responseType: 'blob' as 'blob' };
    // post or get depending on your requirement
    this.http.get(this.config.getEnv('baseUrl')  + '/'  + this.documentName + '/' + this.vcOsid, requestOptions).pipe(map((data: any) => {

      let blob = new Blob([data], {
        type: 'application/pdf' // must match the Accept type
        // type: 'application/octet-stream' // for excel 
      });
      var link = document.createElement('a');
      console.log(blob);
      link.href = window.URL.createObjectURL(blob);
      link.download = this.pdfName + '.pdf';
      link.click();


      window.URL.revokeObjectURL(link.href);


    })).subscribe((result: any) => {
    });

  }


  injectHTML() {

    this.pdfName = this.documentName;
    // let headerOptions = new HttpHeaders({
    //   'template-key': 'html',
    //   'Accept': 'application/pdf'
    // });
    // let requestOptions = { headers: headerOptions, responseType: 'blob' as 'blob' };
    // // post or get depending on your requirement
    // this.http.get(this.config.getEnv('baseUrl')  + '/' + this.documentName + '/' + this.vcOsid, requestOptions).pipe(map((data: any) => {

    //   let blob = new Blob([data], {
    //     type: 'application/pdf' // must match the Accept type
    //     // type: 'application/octet-stream' // for excel 
    //   });
    
    //   this.pdfResponse = window.URL.createObjectURL(blob);
    //   this.pdfResponse2 = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfResponse);
    //   console.log(this.pdfResponse2);
    //   this.pdfResponse = this.readBlob(blob);
    //   console.log(this.pdfResponse);

    // })).subscribe((result: any) => {
    // });


    let headerOptions = new HttpHeaders({
      'template-key': 'html',
      'Accept': 'application/pdf'
    });
    let requestOptions = { headers: headerOptions, responseType: 'blob' as 'blob' };
    const request = {
      "credential": {
            "id": "63ef89c3420fa2903f246758",
            "seqid": 57,
            "type": [
                "VerifiableCredential",
                "UniversityDegreeCredential"
            ],
            "issuer": "did:ulp:fceca616-bf51-43ff-9ccc-28ecda20b16b",
            "issuanceDate": "2023-02-06T11:56:27.259Z",
            "expirationDate": "2023-02-08T11:56:27.259Z",
            "credential_schema": "{\"id\":\"did:ulpschema:c9cc0f03-4f94-4f44-9bcd-b24a86596fa2\",\"type\":\"https://w3c-ccg.github.io/vc-json-schemas/\",\"version\":\"1.0\",\"name\":\"Proof of Academic Evaluation Credential\",\"author\":\"did:example:c276e12ec21ebfeb1f712ebc6f1\",\"authored\":\"2022-12-19T09:22:23.064Z\",\"schema\":{\"$id\":\"Proof-of-Academic-Evaluation-Credential-1.0\",\"type\":\"object\",\"$schema\":\"https://json-schema.org/draft/2019-09/schema\",\"required\":[\"grade\",\"programme\",\"certifyingInstitute\",\"evaluatingInstitute\"],\"properties\":{\"grade\":{\"type\":\"string\",\"description\":\"Grade (%age, GPA, etc.) secured by the holder.\"},\"programme\":{\"type\":\"string\",\"description\":\"Name of the programme pursed by the holder.\"},\"certifyingInstitute\":{\"type\":\"string\",\"description\":\"Name of the instute which certified the said grade in the said skill\"},\"evaluatingInstitute\":{\"type\":\"string\",\"description\":\"Name of the institute which ran the programme and evaluated the holder.\"}},\"description\":\"The holder has secured the <PERCENTAGE/GRADE> in <PROGRAMME> from <ABC_Institute>.\",\"additionalProperties\":false}}",
            "subject": "{\"id\":\"did:ulp:0e890e31-a76c-4719-86fc-7481901d0e5b\",\"grade\":\"6.23\",\"programme\":\"BCA\",\"certifyingInstitute\":\"IIIT Sonepat\",\"evaluatingInstitute\":\"NIT Kurukshetra\",\"name\":\"Rohan\"}",
            "unsigned": null,
            "signed": {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://www.w3.org/2018/credentials/examples/v1"
                ],
                "type": [
                    "VerifiableCredential",
                    "UniversityDegreeCredential"
                ],
                "issuer": "did:ulp:fceca616-bf51-43ff-9ccc-28ecda20b16b",
                "issuanceDate": "2023-02-06T11:56:27.259Z",
                "expirationDate": "2023-02-08T11:56:27.259Z",
                "credentialSubject": {
                    "id": "did:ulp:0e890e31-a76c-4719-86fc-7481901d0e5b",
                    "name": "Rohan",
                    "grade": "6.23",
                    "programme": "BCA",
                    "certifyingInstitute": "IIIT Sonepat",
                    "evaluatingInstitute": "NIT Kurukshetra"
                },
                "options": {
                    "created": "2020-04-02T18:48:36Z",
                    "credentialStatus": {
                        "type": "RevocationList2020Status"
                    }
                },
                "proof": {
                    "proofValue": "eyJhbGciOiJFZERTQSJ9.IntcInZjXCI6e1wiQGNvbnRleHRcIjpbXCJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MVwiLFwiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvZXhhbXBsZXMvdjFcIl0sXCJ0eXBlXCI6W1wiVmVyaWZpYWJsZUNyZWRlbnRpYWxcIixcIlVuaXZlcnNpdHlEZWdyZWVDcmVkZW50aWFsXCJdLFwiY3JlZGVudGlhbFN1YmplY3RcIjp7XCJncmFkZVwiOlwiNi4yM1wiLFwicHJvZ3JhbW1lXCI6XCJCQ0FcIixcImNlcnRpZnlpbmdJbnN0aXR1dGVcIjpcIklJSVQgU29uZXBhdFwiLFwiZXZhbHVhdGluZ0luc3RpdHV0ZVwiOlwiTklUIEt1cnVrc2hldHJhXCJ9fSxcIm9wdGlvbnNcIjp7XCJjcmVhdGVkXCI6XCIyMDIwLTA0LTAyVDE4OjQ4OjM2WlwiLFwiY3JlZGVudGlhbFN0YXR1c1wiOntcInR5cGVcIjpcIlJldm9jYXRpb25MaXN0MjAyMFN0YXR1c1wifX0sXCJzdWJcIjpcImRpZDp1bHA6MGU4OTBlMzEtYTc2Yy00NzE5LTg2ZmMtNzQ4MTkwMWQwZTViXCIsXCJuYmZcIjoxNjc1Njg0NTg3LFwiZXhwXCI6MTY3NTg1NzM4NyxcImlzc1wiOlwiZGlkOnVscDpmY2VjYTYxNi1iZjUxLTQzZmYtOWNjYy0yOGVjZGEyMGIxNmJcIn0i.IYey9_oL7iS0-DNeH2Me2bnXt7mBaOhzYsYUkP80VcXWLe-mzxazcSLnRJcPGut9SIYwiFsJyJKsSHC8GcD5BA",
                    "type": "Ed25519Signature2020",
                    "created": "2023-02-17T14:05:55.690Z",
                    "verificationMethod": "did:ulp:fceca616-bf51-43ff-9ccc-28ecda20b16b",
                    "proofPurpose": "assertionMethod"
                }
            },
            "proof": {
                "proofValue": "eyJhbGciOiJFZERTQSJ9.IntcInZjXCI6e1wiQGNvbnRleHRcIjpbXCJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MVwiLFwiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvZXhhbXBsZXMvdjFcIl0sXCJ0eXBlXCI6W1wiVmVyaWZpYWJsZUNyZWRlbnRpYWxcIixcIlVuaXZlcnNpdHlEZWdyZWVDcmVkZW50aWFsXCJdLFwiY3JlZGVudGlhbFN1YmplY3RcIjp7XCJncmFkZVwiOlwiNi4yM1wiLFwicHJvZ3JhbW1lXCI6XCJCQ0FcIixcImNlcnRpZnlpbmdJbnN0aXR1dGVcIjpcIklJSVQgU29uZXBhdFwiLFwiZXZhbHVhdGluZ0luc3RpdHV0ZVwiOlwiTklUIEt1cnVrc2hldHJhXCJ9fSxcIm9wdGlvbnNcIjp7XCJjcmVhdGVkXCI6XCIyMDIwLTA0LTAyVDE4OjQ4OjM2WlwiLFwiY3JlZGVudGlhbFN0YXR1c1wiOntcInR5cGVcIjpcIlJldm9jYXRpb25MaXN0MjAyMFN0YXR1c1wifX0sXCJzdWJcIjpcImRpZDp1bHA6MGU4OTBlMzEtYTc2Yy00NzE5LTg2ZmMtNzQ4MTkwMWQwZTViXCIsXCJuYmZcIjoxNjc1Njg0NTg3LFwiZXhwXCI6MTY3NTg1NzM4NyxcImlzc1wiOlwiZGlkOnVscDpmY2VjYTYxNi1iZjUxLTQzZmYtOWNjYy0yOGVjZGEyMGIxNmJcIn0i.IYey9_oL7iS0-DNeH2Me2bnXt7mBaOhzYsYUkP80VcXWLe-mzxazcSLnRJcPGut9SIYwiFsJyJKsSHC8GcD5BA",
                "type": "Ed25519Signature2020",
                "created": "2023-02-17T14:05:55.690Z",
                "verificationMethod": "did:ulp:fceca616-bf51-43ff-9ccc-28ecda20b16b",
                "proofPurpose": "assertionMethod"
            },
            "status": "PENDING",
            "created_at": "2023-02-17T14:05:55.755Z",
            "updated_at": "2023-02-17T14:05:55.755Z",
            "presentationsId": null
        },
        "schema":{
        "id": "did:example:evfeb1f712ebc6f1a276e12ec21",
        "type": "https://w3c-ccg.github.io/vc-json-schemas/",
        "version": "1.0",
        "name": "Proof of Academic Evaluation Credential",
        "author": "did:ulp:0bc51dad-885c-44a8-8e95-e3d160060bd2",
        "authored": "2022-12-19T09:22:23.064Z",
        "schema": {
            "$id": "Proof-of-Academic-Evaluation-Credential-1.0",
            "type": "object",
            "$schema": "https://json-schema.org/draft/2019-09/schema",
            "required": [
                "grade",
                "programme",
                "certifyingInstitute",
                "evaluatingInstitute"
            ],
            "properties": {
                "grade": {
                    "type": "string",
                    "description": "Grade (%age, GPA, etc.) secured by the holder."
                },
                "programme": {
                    "type": "string",
                    "description": "Name of the programme pursed by the holder."
                },
                "certifyingInstitute": {
                    "type": "string",
                    "description": "Name of the instute which certified the said grade in the said skill"
                },
                "evaluatingInstitute": {
                    "type": "string",
                    "description": "Name of the institute which ran the programme and evaluated the holder."
                }
            },
            "description": "The holder has secured the <PERCENTAGE/GRADE> in <PROGRAMME> from <ABC_Institute>.",
            "additionalProperties": false
        },
        "proof": {
            "type": "Ed25519Signature2020",
            "created": "2022-12-19T09:22:23Z",
            "proofValue": "z5iBktnPCr3hPqN7FViY948ds5yMhrL1qujMmVD1GmzsbtXw5RUCdu4GKrQZw8U9c4G78SUNmPLTS87tz6kGAHgXB",
            "proofPurpose": "assertionMethod",
            "verificationMethod": "did:key:z6MkqYDbJ5yVgg5UvfRt5DAsk5dvPTgo6H9CZcenziWdHTqN#z6MkqYDbJ5yVgg5UvfRt5DAsk5dvPTgo6H9CZcenziWdHTqN"
        },
        "createdAt": "2023-02-16T07:16:55.178Z",
        "updatedAt": "2023-02-16T07:16:55.178Z",
        "deletedAt": null,
        "tags": [
            "academic",
            "marks",
            "evaluation",
            "education"
        ]
    },
      "template": "<html lang='en'>   <head>     <meta charset='UTF-8' />     <meta http-equiv='X-UA-Compatible' content='IE=edge' />     <meta name='viewport' content='width=device-width, initial-scale=1.0' />     <title>Certificate</title>   </head>   <body>   <div style=\"width:800px; height:600px; padding:20px; text-align:center; border: 10px solid #787878\"> <div style=\"width:750px; height:550px; padding:20px; text-align:center; border: 5px solid #787878\"> <span style=\"font-size:50px; font-weight:bold\">Certificate of Completion</span> <br><br> <span style=\"font-size:25px\"><i>This is to certify that</i></span> <br><br> <span style=\"font-size:30px\"><b>{{name}}</b></span><br/><br/> <span style=\"font-size:25px\"><i>has completed the course</i></span> <br/><br/> <span style=\"font-size:30px\">{{programme}}</span> <br/><br/> <span style=\"font-size:20px\">with score of <b>{{grade}}%</b></span> <br/><br/><br/><br/> <span style=\"font-size:25px\"></span><br> </div> </div>  </body>    </html>",
      "output": "PDF"
    }
    // post or get depending on your requirement
    this.http.post('https://ulp.uniteframework.io/cred-base/credentials/render', request, requestOptions).pipe(map((data: any) => {

      let blob = new Blob([data], {
        type: 'application/pdf' // must match the Accept type
        // type: 'application/octet-stream' // for excel 
      });
    
      this.pdfResponse = window.URL.createObjectURL(blob);
      this.pdfResponse2 = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfResponse);
      console.log(this.pdfResponse2);
      this.pdfResponse = this.readBlob(blob);
      console.log(this.pdfResponse);

    })).subscribe((result: any) => {
    });
  }

  readBlob(blob) {
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      var base64String = reader.result;
      console.log('Base64 String - ', base64String);
      return base64String;
     
    }

  }

}