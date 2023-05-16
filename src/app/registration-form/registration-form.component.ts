import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from '../services/general/general.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastMessageService } from '../services/toast-message/toast-message.service';
import { AuthService } from '../services/auth/auth.service';
import { Location } from '@angular/common';
import { CredentialService } from '../services/credential/credential.service';
import { concatMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { TelemetryService } from '../services/telemetry/telemetry.service';
import { IImpressionEventInput, IInteractEventInput } from '../services/telemetry/telemetry-interface';
import { environment } from 'src/environments/environment';
import { DataService } from '../services/data/data-request.service';
import { IBlock, IDistrict, ISchool, IState } from '../app-interface';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss']
})
export class RegistrationFormComponent implements OnInit {
  baseUrl: string;

  registrationDetails: any;
  schoolDetails: any;
  udiseLinkModalRef: NgbModalRef;
  consentModalRef: NgbModalRef;
  maxDate = new Date().toISOString().split("T")[0];
  isDeclarationSubmitted = false;
  isVerified = null;
  schoolUdiseInput: string = '';
  password: string = '';
  isLoading = false;
  schoolCount: number = 1;

  stateList: IState[];
  districtList: IDistrict[];
  blockList: IBlock[];
  schoolList: ISchool[];

  selectedState: IState;
  selectedDistrict: IDistrict;
  selectedBlock: IBlock;
  selectedSchool: ISchool;

  @ViewChild('udiseLinkModal') udiseLinkModal: TemplateRef<any>;
  @ViewChild('declarationModal') declarationModal: TemplateRef<any>;

  registrationForm = new FormGroup({
    schoolName: new FormControl(null, [Validators.required]),
    udiseId: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]),
    aadharId: new FormControl(null, [Validators.required]),
    joiningdate: new FormControl(null, [Validators.required, Validators.max(Date.now())]),
  });

  udiseLinkForm = new FormGroup({
    state: new FormControl('', [Validators.required]),
    district: new FormControl('', [Validators.required]),
    block: new FormControl('', [Validators.required]),
    school: new FormControl(null, [Validators.required]),
    udiseId: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
  })

  constructor(
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly generalService: GeneralService,
    private readonly toastMessage: ToastMessageService,
    private readonly authService: AuthService,
    private readonly location: Location,
    private readonly credentialService: CredentialService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly telemetryService: TelemetryService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dataService: DataService
  ) {
    this.baseUrl = environment.baseUrl;
    const navigation = this.router.getCurrentNavigation();
    this.registrationDetails = navigation.extras.state;
    const canGoBack = !!(this.router.getCurrentNavigation()?.previousNavigation);

    if (!this.registrationDetails) {
      if (canGoBack) {
        this.location.back();
      } else {
        this.router.navigate(['']);
      }
    }
  }

  ngOnInit(): void {
    this.getStateList();
  }


  get udiseLinkFormControl() {
    return this.udiseLinkForm.controls;
  }

  get schoolName() {
    return this.registrationForm.get('schoolName');
  }

  get udiseId() {
    return this.registrationForm.get('udiseId');
  }

  get name() {
    return this.registrationForm.get('name');
  }

  get aadharId() {
    return this.registrationForm.get('aadharId');
  }

  get joiningdate() {
    return this.registrationForm.get('joiningdate');
  }

  get phone() {
    return this.registrationForm.get('phone');
  }

  ngAfterViewInit() {
    if (this.registrationDetails) {
      if (this.registrationDetails.name) {
        this.registrationForm.get('name').setValue(this.registrationDetails.name);
      }

      if (this.registrationDetails.mobile) {
        this.registrationForm.get('phone').setValue(this.registrationDetails.mobile);
        this.registrationForm.controls.phone.disable();
      }

      if (this.registrationDetails.uuid) {
        this.registrationForm.get('aadharId').setValue(this.registrationDetails.uuid);
      }
    }
    this.cdr.detectChanges();
    const options: NgbModalOptions = {
      backdrop: 'static',
      animation: true,
      centered: true,
      size: 'md'
    }
    console.log("schoolUdiseInput", this.schoolUdiseInput);
    this.udiseLinkModalRef = this.modalService.open(this.udiseLinkModal, options);
    this.raiseImpressionEvent();
  }

  linkUDISE() {
    if (this.registrationDetails) {
      // telemetry check udise
      this.raiseInteractEvent('link-udise');
      this.toastMessage.success('', this.generalService.translateString('SUCCESSFULLY_LINKED'));
      if (this.schoolDetails?.udiseCode) {
        this.registrationForm.get('udiseId').setValue(this.schoolDetails.udiseCode);
      }

      if (this.schoolDetails?.schoolName) {
        this.registrationForm.get('schoolName').setValue(this.schoolDetails.schoolName);
      }
      this.udiseLinkModalRef.close();
    }
  }

  getStateList() {
    this.authService.getStateList().subscribe((res) => {
      if (res.status) {
        this.stateList = res.data;
        this.udiseLinkForm.controls.state.setValue('09'); //PS Hard coded to Uttar Pradesh
        this.onStateChange(this.udiseLinkForm.controls.state.value);
      }
    });
  }

  onStateChange(selectedStateCode: string) {
    this.selectedState = this.stateList.find(item => item.stateCode === selectedStateCode);
    this.districtList = [];
    this.blockList = [];
    this.schoolList = [];
    this.udiseLinkForm.controls.district.setValue('');
    this.udiseLinkForm.controls.block.setValue('');
    this.udiseLinkForm.controls.school.setValue('');
    this.isLoading = true;

    this.authService.getDistrictList({ stateCode: selectedStateCode }).subscribe((res) => {
      this.isLoading = false;
      if (res.status) {
        this.districtList = res.data;
      }
    }, error => {
      this.isLoading = false;
    });
  }

  onDistrictChange(selectedDistrictCode: string) {
    this.selectedDistrict = this.districtList.find(item => item.districtCode === selectedDistrictCode);
    this.blockList = [];
    this.schoolList = [];
    this.udiseLinkForm.controls.block.setValue('');
    this.udiseLinkForm.controls.school.setValue('');
    this.isLoading = true;
    this.authService.getBlockList({ districtCode: selectedDistrictCode }).subscribe((res) => {
      this.isLoading = false;
      if (res.status) {
        this.blockList = res.data;
      }
    }, error => {
      this.isLoading = false;
    });
  }

  onBlockChange(selectedBlockCode: string) {
    this.selectedBlock = this.blockList.find(item => item.blockCode === selectedBlockCode);
    this.schoolList = [];
    this.udiseLinkForm.controls.school.setValue('');

    this.isLoading = true;

    // const payload = {
    //   "regionType": "2",
    //   "regionCd": this.udiseLinkForm.controls.district.value,
    //   "sortBy": "schoolName"
    // }
    // this.authService.getSchoolList(payload).subscribe((res) => {
    //   this.isLoading = false;
    //   if (res.status) {
    //     this.schoolList = res.data.pagingContent.filter(item => item.eduBlockCode === this.udiseLinkForm.controls.block.value);
    //   }
    // }, error => {
    //   this.isLoading = false;
    // });

    
    this.getSchools();
  }


  getSchools() {
    const payload = {
      "regionType": "2",
      "regionCd": this.udiseLinkForm.controls.district.value,
      "sortBy": "schoolName",
      "pageSize": "500",
      "pageNo": this.schoolCount
    }
    this.authService.getSchoolList(payload).subscribe((res) => {
      if (res.status) {
        this.schoolList = [...this.schoolList, ...res.data.pagingContent.filter(item => item.eduBlockCode === this.udiseLinkForm.controls.block.value)];
        this.schoolCount++;
        this.getSchools();
      } else {
        this.isLoading = false;
      }
    }, error => {
      this.isLoading = false;
    });
  }

  onSchoolChange(selectedSchoolCode: string) {
    this.selectedSchool = this.schoolList.find(item => item.udiseCode === selectedSchoolCode);
  }

  submitDeclarationForm(isConfirmed: boolean) {
    this.isDeclarationSubmitted = isConfirmed;
    this.consentModalRef.close()

    if (isConfirmed) {
      this.onSubmit();
    }
  }

  verifyUDISE() {
    if (this.udiseLinkForm.value.udiseId !== this.selectedSchool.udiseCode) {
      this.toastMessage.error('', this.generalService.translateString('SCHOOL_UDISE_NOT_MATCHED'));
      return;
    }
    const payload = {
      url: `${this.baseUrl}/v1/school/verify`,
      data: {
        password: this.udiseLinkForm.value.password,
        requestbody: {
          udiseCode: this.udiseLinkForm.value.udiseId
        }
      }
    }
    this.dataService.post(payload).subscribe((res: any) => {
      if (res?.status) {
        this.schoolDetails = res.response.data;
        this.linkUDISE();
      } else {
        this.toastMessage.error('', this.generalService.translateString('INVALID_SCHOOL_UDISE_OR_PASSWORD'));
      }
    }, error => {
      console.error(error);
      this.toastMessage.error('', this.generalService.translateString('INVALID_SCHOOL_UDISE_OR_PASSWORD'));
    });
  }

  onSubmit() {
    console.log(this.registrationForm.value);
    console.log('schoolDetails', this.schoolDetails);
    if (!this.isDeclarationSubmitted) {
      this.consentModalRef = this.modalService.open(this.declarationModal, { animation: true, centered: true });
      return;
    }

    this.registrationForm.controls.phone.enable();
    if (this.registrationForm.valid) {
      // telemetry successful reg claim
      this.raiseInteractEvent('registration-success')
      this.isLoading = true;
      const payload = {
        digiacc: "portal",
        userdata: {
          teacher: {
            name: this.registrationForm.value.name,
            joiningdate: this.registrationForm.value.joiningdate,
            aadharId: this.registrationForm.value.aadharId,
            mobile: this.registrationForm.value.phone,
            schoolUdise: this.registrationForm.value.udiseId,
            meripehchanLoginId: this.registrationDetails.meripehchanid,
            username: this.registrationDetails.uuid,
            consent: "yes",
            consentDate: new Date().toISOString().substring(0, 10),
            did: "",
            school_name: this.selectedSchool.schoolName,
            stateCode: this.selectedState.stateCode,
            stateName: this.selectedState.stateName,
            districtCode: this.selectedDistrict.districtCode,
            districtName: this.selectedDistrict.districtName,
            blockCode: this.selectedBlock.blockCode,
            blockName: this.selectedBlock.blockName,
          },
          school: {
            clientId: this.schoolDetails.clientId || '-',
            clientSecret: this.schoolDetails.clientSecret || '-',
            schoolName: this.schoolDetails.schoolName,
            udiseCode: this.schoolDetails.udiseCode,
            schoolCategory: this.schoolDetails.schCategoryId,
            schoolManagementCenter: this.schoolDetails.schMgmtCenterId,
            schoolManagementState: 0,
            schoolType: this.schoolDetails.schTypeId,
            classFrom: this.schoolDetails.lowestClass,
            classTo: this.schoolDetails.highestClass,
            stateCode: typeof this.schoolDetails?.eduStateCode === 'string' ? Number(this.schoolDetails?.eduStateCode) : this.schoolDetails?.eduStateCode,
            stateName: this.selectedState.stateName,
            districtName: this.selectedDistrict.districtName,
            blockName: this.selectedBlock.blockName,
            locationType: this.schoolDetails.schLocTypeId,
            headOfSchoolMobile: '-',
            respondentMobile: '-',
            alternateMobile: '-',
            schoolEmail: this.schoolDetails.email || '-',
            did: ''
          }
        },
        digimpid: this.registrationDetails.meripehchanid,
      }

      // this.authService.verifyAadhar(this.registrationForm.value.aadharId).pipe(
      //   concatMap((res: any) => {
      //     if (res.success && res?.result?.aadhaar_token) {
      //       payload.userdata.teacher.aadharId = res.result.aadhaar_token;
      //       return this.authService.ssoSignUp(payload);
      //     } else {
      //       return throwError(this.generalService.translateString('AADHAR_VERIFICATION_FAILED'));  
      //     }
      //   }),
      this.authService.ssoSignUp(payload).pipe(
        // concatMap(_ => this.authService.getSchoolDetails()),
        concatMap((res: any) => {
          if (res?.userData?.school) {
            localStorage.setItem('schoolDetails', JSON.stringify(res.userData.school));
          }
          return this.credentialService.issueCredential();
        })
      ).subscribe((res: any) => {
        this.isLoading = false;
        console.log("final", res);
        this.toastMessage.success("", this.generalService.translateString('USER_REGISTERED_SUCCESSFULLY'));
        this.router.navigate(['/dashboard'], { state: { isFirstTimeLogin: true } });
      }, (error: any) => {
        console.error(error);
        this.isLoading = false;
        this.toastMessage.error("", this.generalService.translateString('ERROR_WHILE_REGISTER_USER'));
      });
    }
  }

  objectValuesToString(obj: any) {
    Object.keys(obj).forEach((key: any) => {
      if (typeof obj[key] === 'object') {
        return this.objectValuesToString(obj[key]);
      }
      obj[key] = '' + obj[key];
    });
    return obj;
  }

  raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
    console.log("raiseInteractEvent")
    const telemetryInteract: IInteractEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        id,
        type,
        subtype,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
      }
    };
    this.telemetryService.interact(telemetryInteract);
  }

  raiseImpressionEvent() {
    const telemetryImpression: IImpressionEventInput = {
      context: {
        env: this.activatedRoute.snapshot?.data?.telemetry?.env,
        cdata: []
      },
      edata: {
        type: this.activatedRoute.snapshot?.data?.telemetry?.type,
        pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
        uri: this.router.url,
        subtype: this.activatedRoute.snapshot?.data?.telemetry?.subtype,
      }
    };
    this.telemetryService.impression(telemetryImpression);
  }
}
