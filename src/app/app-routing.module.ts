import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsComponent } from './forms/forms.component';
import { LayoutsComponent } from './layouts/layouts.component';
import { PanelsComponent } from './layouts/modal/panels/panels.component';
import { EditPanelComponent } from './layouts/modal/panels/edit-panel/edit-panel.component';
import { AddPanelComponent } from './layouts/modal/panels/add-panel/add-panel.component';
import { TablesComponent } from './tables/tables.component';
import { AttestationComponent } from './tables/attestation/attestation.component';
import { AuthGuard } from './utility/app.guard';
import { DocViewComponent } from './layouts/doc-view/doc-view.component';
import { InstallComponent } from './install/install.component';
import { HomeComponent } from './home/home.component';
import { KeycloakloginComponent } from './authentication/login/keycloaklogin.component';
import { LogoutComponent } from './authentication/logout/logout.component';
import { SearchComponent } from './discovery/search/search.component';
import { DocumentsComponent } from './documents/documents.component';
import { AddDocumentComponent } from './documents/add-document/add-document.component';
import { ScanQrCodeComponent } from './documents/scan-qr-code/scan-qr-code.component';
import { BrowseDocumentsComponent } from './documents/browse-documents/browse-documents.component';
import { PagesComponent } from './pages/pages.component';
import { DocDetailViewComponent } from './documents/doc-detail-view/doc-detail-view.component';
import { DocTypesComponent } from './tables/doc-types/doc-types.component';
import { CreateCertificateComponent } from './create-certificate/create-certificate.component';
import { DashboardComponent } from './issure/dashboard/dashboard.component';
import { AddCertificateComponent } from './issure/add-certificate/add-certificate.component';
import { GetRecordsComponent } from './issure/get-records/get-records.component';
import { AddRecordsComponent } from './issure/add-records/add-records.component';
import { PreviewHtmlComponent } from './issure/preview-html/preview-html.component';
import { VerifyComponent } from './issure/verify/verify.component';
import { AdvanceEditorComponent } from './issure/advance-editor/advance-editor.component';
import { PdfViewComponent } from './issure/pdf-view/pdf-view.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { RegisterEntityComponent } from './register-entity/register-entity.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { IssuedCredentialComponent } from './issued-credential/issued-credential.component';
import { ClaimApprovalComponent } from './claim-approval/claim-approval.component';
import { OauthCallbackComponent } from './oauth-callback/oauth-callback.component';
import { RegistrationFormComponent } from './registration-form/registration-form.component';
import { AuthenticationGuard } from './utility/authentication.guard';
import { MyAccountComponent } from './my-account/my-account.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { EkycComponent } from './ekyc/ekyc.component';

// import { CreateCertificateComponent } from './create-certificate/create-certificate.component';
// import { FaqComponent } from './custom-components/faq/faq.component';
const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'digilocker-callback',
    component: OauthCallbackComponent,
    data: {
      showToolbar: false,
      telemetry: {
        env: 'digilocker', pageid: 'digilocker-callback', type: 'digilocker', subtype: 'scroll'
      }
    }
  },
  {
    path: 'sign-in',
    component: RegistrationComponent,
    data: {
      showToolbar: false,
      telemetry: {
        env: 'sign-in', pageid: 'sign-in', type: 'edit', subtype: 'scroll'
      }
    }
  },
  {
    path: 'ekyc',
    component: EkycComponent,
    data: {
      showToolbar: false,
      telemetry: {
        env: 'login', pageid: 'kyc', type: 'edit', subtype: 'scroll'
      }
    }
  },
  {
    path: 'register',
    component: RegistrationFormComponent
  },
  {
    path: 'dashboard',
    component: MainDashboardComponent,
     canActivate: [AuthenticationGuard],
    children: [
      {
        path: 'register-entity',
        component: RegisterEntityComponent,
        data: {
          showToolbar: false,
          telemetry: {
            env: 'register', pageid: 'register-entity', type: 'edit', subtype: 'scroll'
          }
        }
        
      },
      {
        path: 'issued-credential',
        component: IssuedCredentialComponent,
        data: {
          showToolbar: false,
          telemetry: {
            env: 'credential', pageid: 'issued-credential', type: 'view', subtype: 'scroll'
          }
        }
      },
      {
        path: 'claim-approval',
        component: ClaimApprovalComponent,
        data: {
          showToolbar: false,
          telemetry: {
            env: 'approval', pageid: 'claim-approval', type: 'view', subtype: 'scroll'
          }
        }
      },
      {
        path: 'registration-form',
        component: RegistrationFormComponent,
        data: {
          showToolbar: false,
          telemetry: {
            env: 'registration', pageid: 'registration-form', type: 'edit', subtype: 'scroll'
          }
        }
      },
      {
        path: 'my-account',
        component: DocViewComponent,
        data: {
          showToolbar: false,
          telemetry: {
            env: 'my-account', pageid: 'my-account', type: 'view', subtype: 'scroll'
          }
        }
      },
      {
        path: 'doc-view',
        component: DocViewComponent,
        data: {
          showToolbar: false,
          telemetry: {
            env: 'view-document', pageid: 'doc-view', type: 'view', subtype: 'scroll'
          }
        }
      },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
// { path: 'login', component: LoginComponent },
// {
//   path: 'issue-credentials',
//   component: GetRecordsComponent
// },
// Home
// { path: '', component: HomeComponent },

// { path: '', component: KeycloakloginComponent,  canActivate: [AuthGuard]},



//{ path: '', component: FormsComponent },
// Auth
// { path: 'login', component: KeycloakloginComponent ,  canActivate: [AuthGuard]},
// { path: 'logout', component: LogoutComponent },

// Forms
// { path: 'form/:form', component: FormsComponent },
// { path: 'form/:form/:id', component: FormsComponent, canActivate: [AuthGuard] },


// Layouts
// { path: ':layout', component: LayoutsComponent, canActivate: [AuthGuard] },
// {
//   path: 'profile/:layout', component: LayoutsComponent,
//   canActivate: [AuthGuard],
//   children: [
//     {
//       path: 'edit',
//       component: PanelsComponent,
//       outlet: 'claim',
//       children: [
//         {
//           path: ':form',
//           component: EditPanelComponent
//         },
//         {
//           path: ':form/:id',
//           component: EditPanelComponent
//         }
//       ]
//     },
//     {
//       path: 'add',
//       component: PanelsComponent,
//       outlet: 'claim',
//       children: [
//         {
//           path: ':form',
//           component: AddPanelComponent
//         }
//       ]
//     }
//   ]
// },

// Pages
// { path: 'page/:page', component: PagesComponent },

// Tables
// { path: ':entity/attestation/:table', component: TablesComponent, canActivate: [AuthGuard] },
// { path: ':entity/attestation/:table/:id', component: AttestationComponent, canActivate: [AuthGuard] },
// { path: ':entity/documents', component: DocumentsComponent, canActivate: [AuthGuard] },
// { path: ':entity/documents/detail/view/:type/:id', component: DocDetailViewComponent, canActivate: [AuthGuard] },
// { path: ':entity/documents/view/:type/:id', component: DocViewComponent, canActivate: [AuthGuard] },
// { path: ':entity/documents/browse', component: BrowseDocumentsComponent, canActivate: [AuthGuard] },
// { path: ':entity/documents/:type/add/:id', component: AddDocumentComponent, canActivate: [AuthGuard] },
// { path: ':entity/documents/add/:type', component: AddDocumentComponent, canActivate: [AuthGuard] },
// { path: ':entity/documents/add/:type/:id', component: AddDocumentComponent, canActivate: [AuthGuard] },
// { path: ':entity/documents/scan/vc', component: ScanQrCodeComponent, canActivate: [AuthGuard] },
// { path: 'document/detail', component: DocDetailViewComponent, canActivate: [AuthGuard] },
// { path: 'document/view/:id', component: DocViewComponent, canActivate: [AuthGuard] },

// { path: 'discovery', component: SearchComponent },
// { path: 'doc-types', component: DocTypesComponent },
// { path: 'template', component: CreateCertificateComponent },

//  { path: 'dashboard', component: DashboardComponent , canActivate: [AuthGuard] },
//  { path: 'records', component: GetRecordsComponent , canActivate: [AuthGuard] },
// { path: 'records', component: GetRecordsComponent },
// { path: 'records/:document', component: GetRecordsComponent, canActivate: [AuthGuard] },
// { path: 'add-records/:document', component: AddRecordsComponent, canActivate: [AuthGuard] },
//  { path: 'certificate/:form', component: AddCertificateComponent , canActivate: [AuthGuard] },
// { path: 'certificate', component: AddCertificateComponent, canActivate: [AuthGuard] },

// { path: 'preview-html', component: PreviewHtmlComponent, canActivate: [AuthGuard] },
// { path: 'verify', component: VerifyComponent },
// { path: 'advance-editor', component: AdvanceEditorComponent },
//  { path: 'pdf-view', component: PdfViewComponent  , canActivate: [AuthGuard] },
//  { path: 'pdf-view/:document/:id', component: PdfViewComponent  , canActivate: [AuthGuard] },
// { path: 'pdf-view', component: PdfViewComponent },
// { path: 'pdf-view/:document/:id', component: PdfViewComponent },

// Installation
// { path: 'install', component: InstallComponent },

// Custom
// { path: 'faq', component: FaqComponent },



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
