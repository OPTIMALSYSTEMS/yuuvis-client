import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AppCacheService, BackendService, Direction, UserService, YuvUser } from '@yuuvis/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private STORAGE_KEY = 'yuv.app.framework.layout';
  private STORAGE_KEY_REGEXP = new RegExp('^yuv.app.');
  private layoutSettings: LayoutSettings = {};
  private layoutSettingsSource = new ReplaySubject<LayoutSettings>();
  public layoutSettings$: Observable<LayoutSettings> = this.layoutSettingsSource.asObservable();

  constructor(@Inject(DOCUMENT) private document: any, private appCache: AppCacheService, private userService: UserService, private backend: BackendService) {
    // load saved settings
    this.appCache.getItem(this.STORAGE_KEY).subscribe(settings => this.processLayoutSettings(settings));
    this.userService.user$.subscribe((user: YuvUser) => {
      this.applyDirection(user.uiDirection);
    });
  }

  private processLayoutSettings(settings: any) {
    this.layoutSettings = settings || {};
    this.layoutSettingsSource.next(this.layoutSettings);
    this.applyLayoutSettings(this.layoutSettings);
  }

  private applyDirection(direction: string) {
    const body = this.document.getElementsByTagName('body')[0];
    const bodyClassList = body.classList;
    body.setAttribute('dir', direction);
    if (direction === Direction.RTL) {
      bodyClassList.add('yuv-rtl');
    } else {
      bodyClassList.remove('yuv-rtl');
    }
  }

  private applyLayoutSettings(settings: LayoutSettings) {
    const darkModeClass = 'dark';
    const body = this.document.getElementsByTagName('body')[0];
    const bodyClassList = body.classList;
    if (bodyClassList.contains(darkModeClass) && !settings.darkMode) {
      bodyClassList.remove(darkModeClass);
    } else if (!bodyClassList.contains(darkModeClass) && settings.darkMode) {
      bodyClassList.add(darkModeClass);
    }
  }

  getLayoutSettings() {
    return this.layoutSettings;
  }

  setDarkMode(darkMode: boolean) {
    this.layoutSettings.darkMode = darkMode;
    this.saveSettings();
  }

  setAccentColor(rgb: string) {
    this.layoutSettings.accentColor = rgb;
    this.saveSettings();
  }

  setDashboardBackground(dataUrl: string) {
    this.layoutSettings.dashboardBackground = dataUrl;
    this.saveSettings();
  }

  private saveSettings() {
    this.appCache.setItem(this.STORAGE_KEY, this.layoutSettings).subscribe();
    this.processLayoutSettings(this.layoutSettings);
  }

  private cleanupData(data: any, filter?: (key: string) => boolean) {
    filter = filter || ((key: string) => !key.match(this.STORAGE_KEY_REGEXP));
    Object.keys(data).forEach(k => filter(k) && delete data[k]);
    return data;
  }

  private generateStorageJsonUri() {
    return this.appCache.getStorage().pipe(
      map(data => {
        const blob = new Blob([JSON.stringify(this.cleanupData(data), null, 2)], { type: 'text/json' });
        const uri = URL.createObjectURL(blob);
        // setTimeout(() => URL.revokeObjectURL(uri), 10000);
        return uri;
      })
    );
  }

  downloadLayout(filename = 'settings.json') {
    this.generateStorageJsonUri().subscribe(uri => this.backend.download(uri, filename));
  }

  uploadLayout(data: string | any, filter?: (key: string) => boolean, force = false) {
    const layout = this.cleanupData(typeof data === 'string' ? JSON.parse(data) : data, filter);
    if (layout.hasOwnProperty(this.STORAGE_KEY) || force) {
      this.processLayoutSettings(layout[this.STORAGE_KEY]);
    }
    return force ? this.clearAll().pipe(switchMap(() => this.appCache.setStorage(layout))) : this.appCache.setStorage(layout);
  }

  clearLayout() {
    return this.appCache.getStorage().pipe(switchMap(data => this.uploadLayout(data, (key: string) => !!key.match(this.STORAGE_KEY_REGEXP), true)));
  }

  clearAll() {
    return this.appCache.clear();
  }
}

export interface LayoutSettings {
  darkMode?: boolean;
  accentColor?: string;
  dashboardBackground?: string;
}
