import { Injectable } from '@angular/core';
import { DeviceDetectorService, DeviceInfo } from 'ngx-device-detector';
import { Logger } from '../logger/logger';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  // if the device is a mobile device (android / iPhone / windows-phone etc)
  isMobile: boolean;
  // if the device us a tablet (iPad etc)
  isTablet: boolean;
  // if the app is running on a Desktop browser
  isDesktop: boolean;
  info: DeviceInfo;

  constructor(private deviceService: DeviceDetectorService, private logger: Logger) {}

  // called on core init
  init() {
    this.info = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktop = this.deviceService.isDesktop();

    this.logger.debug('device info', this.info);
    this.logger.debug(`mobile ${this.isMobile}`);
    this.logger.debug(`tablet: ${this.isTablet}`);
    this.logger.debug(`desktop: ${this.isDesktop}`);
  }
}
