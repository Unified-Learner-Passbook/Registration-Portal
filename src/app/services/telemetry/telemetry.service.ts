import { Injectable } from '@angular/core';
import { CsTelemetryModule } from '@project-sunbird/client-services/telemetry';
import { Cdata, Context, IAuditEventInput, IEndEventInput, IImpressionEventInput, IInteractEventInput, ImpressionEData, InteractEData, IShareEventInput, IStartEventInput, ITelemetryContextData, ITelemetryEvent, TelemetryObject } from './telemetry-interface';
import { v4 as uuidv4 } from 'uuid';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  uid: string = 'anonymous';
  did: string;
  deviceType: string;
  telemetryInstance: CsTelemetryModule;
  private context: Context;

  constructor() {
    this.telemetryInstance = CsTelemetryModule.instance;
  }

  public initializeTelemetry() {
    this.deviceType = this.getDeviceType();
    this.context = {
      mode: "",
      sid: uuidv4(),
      did: this.did,
      uid: this.uid,
      channel: "default",
      env: 'registration.portal',
      pdata: {
        id: "registration.portal",
        pid: "0.0.1",
        ver: "registration.portal"
      },
      contextRollup: {},
      tags: [],
      host: 'http://localhost:9001',
      endpoint: '/v1/telemetry',
      // userData?: {
      //     firstName: string;
      //     lastName: string;
      // }
    };

    if (!this.telemetryInstance.isInitialised) {
      const telemetryConfig = {
        apislug: '',
        pdata: this.context.pdata,
        env: 'registration.portal',
        channel: this.context.channel,
        did: this.context.did,
        authtoken: this.context.authToken || '',
        uid: this.context.uid || '',
        sid: this.context.sid,
        batchsize: 1,// 20
        mode: this.context.mode,
        host: this.context.host || 'http://localhost:9001',
        endpoint: this.context.endpoint || '/v1/telemetry',
        tags: this.context.tags,
        enableValidation: true
      };
      this.telemetryInstance.init({});
      this.telemetryInstance.telemetryService.initTelemetry(
        {
          config: telemetryConfig,
          userOrgDetails: {}
        }
      );
    }
  }

  public start(startEventInput: IStartEventInput) {
    if (this.telemetryInstance.isInitialised) {
      const eventData: ITelemetryEvent = this.getEventData(startEventInput);
      this.telemetryInstance.telemetryService.raiseStartTelemetry({
        options: eventData.options,
        edata: eventData.edata
      });
    }
  }

  public interact(interactEventInput: IInteractEventInput) {
    if (this.telemetryInstance.isInitialised) {
      const eventData: ITelemetryEvent = this.getEventData(interactEventInput);
      this.telemetryInstance.telemetryService.raiseInteractTelemetry({
        options: eventData.options,
        edata: eventData.edata
      });
    }
  }

  public impression(impressionEventInput: IImpressionEventInput) {
    if (this.telemetryInstance.isInitialised) {
      const eventData: ITelemetryEvent = this.getEventData(impressionEventInput);
      this.telemetryInstance.telemetryService.raiseImpressionTelemetry({
        options: eventData.options,
        edata: eventData.edata
      });
    }
  }

  public audit(auditEventInput: IAuditEventInput) {
    if (this.telemetryInstance.isInitialised) {
      const eventData: ITelemetryEvent = this.getEventData(auditEventInput);
      this.telemetryInstance.telemetryService.raiseAuditTelemetry({
        edata: eventData.edata,
        options: eventData.options
      });
    }
  }

  public share(shareEventInput: IShareEventInput) {
    if (this.telemetryInstance.isInitialised) {
      const eventData: ITelemetryEvent = this.getEventData(shareEventInput);
      this.telemetryInstance.telemetryService.raiseShareTelemetry({
        edata: eventData.edata,
        options: eventData.options
      });
    }
  }

  public end(endEventInput: IEndEventInput) {
    if (this.telemetryInstance.isInitialised) {
      const eventData: ITelemetryEvent = this.getEventData(endEventInput);
      this.telemetryInstance.telemetryService.raiseEndTelemetry({
        edata: eventData.edata,
        options: eventData.options
      });
    }
  }

  private getDeviceType(): string {
    const deviceDetectorService = new DeviceDetectorService('browser');
    let device = '';
    if (deviceDetectorService.isMobile()) {
      device = 'Mobile';
    } else if (deviceDetectorService.isTablet()) {
      device = 'Tab';
    } else if (deviceDetectorService.isDesktop()) {
      device = 'Desktop';
    }
    return device;
  }

  private getEventData(eventInput: any) {
    const event: ITelemetryEvent = {
      edata: eventInput.edata,
      options: {
        context: this.getEventContext(eventInput),
        object: this.getEventObject(eventInput),
        tags: []
      }
    };
    return event;
  }

  private getEventObject(eventInput: any) {
    if (eventInput.object) {
      const eventObjectData: TelemetryObject = {
        id: eventInput.object.id || '',
        type: eventInput.object.type || '',
        ver: eventInput.object.ver || '',
        rollup: eventInput.object.rollup || {}
      };
      return eventObjectData;
    } else {
      return {};
    }
  }

  private getEventContext(eventInput: any) {
    const eventContextData: ITelemetryContextData = {
      channel: eventInput.edata.channel || this.context.channel,
      pdata: eventInput.context.pdata || this.context.pdata,
      env: eventInput.context.env || this.context.env,
      sid: eventInput.sid || this.context.sid,
      uid: this.uid,
      cdata: eventInput.context.cdata || [],
      // rollup: this.getRollUpData(this.context.userOrgDetails.organisationIds)
    };
    if (this.context.sid) {
      eventContextData.cdata.push({
        id: this.context.sid,
        type: 'UserSession'
      });
    }
    eventContextData.cdata.push({
      id: this.deviceType,
      type: 'Device'
    });
    return eventContextData;
  }

  public getRollUpData(data: Array<string> = []) {
    const rollUp = {};
    data.forEach((element, index) => rollUp['l' + (index + 1)] = element);
    return rollUp;
  }
}
