import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { CredentialService } from 'src/app/services/credential/credential.service';

@Component({
    selector: 'app-doc-view',
    templateUrl: './doc-view.component.html',
    styleUrls: ['./doc-view.component.scss']
})
export class DocViewComponent implements OnInit, OnDestroy {
    docUrl: string;
    extension;
    document = [];
    loader: boolean = true;
    docName: any;
    docDetails: any;
    credential: any;
    schemaId: string;
    templateId: string;
    public unsubscribe$ = new Subject<void>();
    private readonly canGoBack: boolean;
    constructor(
        public readonly generalService: GeneralService,
        private readonly router: Router,
        private readonly http: HttpClient,
        private readonly location: Location,
        private readonly credentialService: CredentialService
    ) {
        // const navigation = this.router.getCurrentNavigation();
        // this.credential = navigation?.extras?.state;
        // this.canGoBack = !!(this.router.getCurrentNavigation()?.previousNavigation);

        // if (!this.credential) {
        //     if (this.canGoBack) {
        //         this.location.back();
        //     } else {
        //         this.router.navigate(['/dashboard']);
        //     }
        // }
    }

    ngOnInit(): void {
        this.credentialService.getAllCredentials().pipe(takeUntil(this.unsubscribe$))
            .subscribe((res) => {
                this.credential = res[0];
                if (this.credential?.credential_schema) {
                    this.schemaId = this.credential.schemaId;
                    this.getTemplate(this.schemaId).pipe(takeUntil(this.unsubscribe$))
                        .subscribe((res) => {
                            this.templateId = res?.result?.[0]?.id;
                            this.getPDF(res?.result?.[0]?.template);
                        });
                } else {
                    console.error("Something went wrong!");
                }
            });
    }

    getSchema(id): Observable<any> {
        return this.generalService.getData(`https://ulp.uniteframework.io/cred-schema/schema/jsonld?id=${id}`, true);
    }

    getTemplate(id: string): Observable<any> {
        return this.generalService.getData(`https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/rendertemplateschema/${id}`, true)
    }

    getPDF(template) {
        let headerOptions = new HttpHeaders({
            'Accept': 'application/pdf'
        });
        let requestOptions = { headers: headerOptions, responseType: 'blob' as 'json' };
        const credential_schema = this.credential.credential_schema;
        delete this.credential.credential_schema;
        delete this.credential.schemaId;
        const request = {
            credential: this.credential,
            schema: credential_schema,
            template: template,
            output: "HTML"
        }
        // delete request.credential.credentialSubject;
        this.http.post('https://ulp.uniteframework.io/ulp-bff/v1/sso/student/credentials/render', request, requestOptions).pipe(map((data: any) => {
            let blob = new Blob([data], {
                type: 'application/pdf' // must match the Accept type
            });
            this.docUrl = window.URL.createObjectURL(blob);
        }), takeUntil(this.unsubscribe$)).subscribe((result: any) => {
            this.loader = false;
            this.extension = 'pdf';
        });
    }

    goBack() {
        window.history.go(-1);
    }

    downloadCertificate(url) {
        let link = document.createElement("a");
        link.href = url;
        link.download = 'certificate.pdf';
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
