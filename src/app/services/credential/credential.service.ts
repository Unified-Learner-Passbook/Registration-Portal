import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import { concatMap, map, switchMap, toArray } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { DataService } from '../data/data-request.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CredentialService {
  baseUrl: string;

  private schemas: any[] = [];
  constructor(
    private readonly dataService: DataService,
    private readonly authService: AuthService
  ) {
    this.baseUrl = environment.baseUrl;

   }
  findSchema(schemaId: string) {
    if (this.schemas.length) {
      return this.schemas.find((schema: any) => schema.id === schemaId);
    }
    return false;
  }

  getCredentialSchemaId(credentialId: string): Observable<any> {
    const payload = { url: `${this.baseUrl}/v1/sso/student/credentials/schema/${credentialId}` };
    return this.dataService.get(payload).pipe(map((res: any) => res.result));
  }

  getCredentials(data?:any): Observable<any> {
    const payload:any= {
      url: `${this.baseUrl}/v1/sso/student/credentials/search`,
      data: {}
    };

    if (data?.issuerId) {
      payload.data.issuer = { id: data.issuerId };
      
        if(data?.grade) {
         payload.data.subject.grade = data.grade
        }
        if(data?.academicYear) {
          payload.data.subject.academicYear= data.academicYear
        }
       
      
    } else {
      payload.data = {
        subject: { id: this.authService.currentUser.did }
      }
    }
   
    return this.dataService.post(payload).pipe(map((res: any) => res.result));
  }

  getSchema(schemaId: string): Observable<any> {
    const schema = this.findSchema(schemaId);
    if (schema) {
      return of(schema);
    }

    const payload = { url: `${this.baseUrl}/v1/sso/student/credentials/schema/json/${schemaId}` };
    return this.dataService.get(payload).pipe(map((res: any) => {
      this.schemas.push(res.result);
      return res.result;
    }));
  }

  // One after one
  getAllCredentials(issuer?: string): Observable<any> {
    return this.getCredentials(issuer).pipe(
      switchMap((credentials: any) => {
        return from(credentials).pipe(
          concatMap((cred: any) => {
            return this.getCredentialSchemaId(cred.id).pipe(
              concatMap((res: any) => {
                cred.schemaId = res.credential_schema;
                return this.getSchema(res.credential_schema).pipe(
                  map((schema: any) => {
                    cred.credential_schema = schema;
                    return cred;
                  })
                );
              })
            );
          }), toArray()
        )
      })
    );
  }

  // Parallel
  getIssuedCredentials(issuer?: string): Observable<any> {
    return this.getCredentials(issuer).pipe(
      switchMap((credentials: any) => {
        if (credentials.length) {
          return forkJoin(
            credentials.map((cred: any) => {
              return this.getCredentialSchemaId(cred.id).pipe(
                concatMap((res: any) => {
                  cred.schemaId = res.credential_schema;
                  return this.getSchema(res.credential_schema).pipe(
                    map((schema: any) => {
                      cred.credential_schema = schema;
                      return cred;
                    })
                  );
                })
              );
            })
          );
        }
        return of([]);
      })
    );
  }

  issueCredential() {
    const nextYearDate = new Date();
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    const payload = {
      url: `${this.baseUrl}/v1/sso/student/credentials/issue`, //TODO: Need to change this to /teacher
      data: {
        "credential": {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
          ],
          "id": "did:ulp:b4a191af-d86e-453c-9d0e-dd4771067235",
          "type": [
            "VerifiableCredential",
            "UniversityDegreeCredential"
          ],
          "issuer": this.authService.schoolDetails?.did,
          "issuanceDate": new Date().toISOString(),
          "expirationDate": nextYearDate.toISOString(),
          "credentialSubject": {
            "id": this.authService.currentUser.did,
            "principalName": this.authService.currentUser.name,
            "schoolName": this.authService.schoolDetails?.schoolName,
            "schoolUdiseId": this.authService.currentUser?.schoolUdise,
            "pricipalContactNumber": this.authService.currentUser?.mobile || "8698645680"
          },
          "options": {
            "created": "2020-04-02T18:48:36Z",
            "credentialStatus": {
              "type": "RevocationList2020Status"
            }
          }
        },
        "credentialSchemaId": "clfmjhp3w0000tj15a25igj9p", // TODO: Need to removed hard coded value
        "tags": ["tag1", "tag2", "tag3"]
      }
    };

    return this.dataService.post(payload).pipe(map((res: any) => {
      if (res.success && res.result) {
        return res.result;
      } else {
        throwError(new Error('Error while issuing certificate for principal'));
      }
    }))
  }

  updateStudent(data: any): Observable<any> {
    const payload = {
      url: `${this.baseUrl}/v1/sso/student/update`,
      data
    }
    return this.dataService.post(payload);
  }

  verifyAadhar(data: any): Observable<any> {
    const payload = {
      url: `${this.baseUrl}/v1/sso/student/aadhaar/verify`,
      data
    }
    return this.dataService.post(payload);
  }
}
