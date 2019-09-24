import { Injectable } from '@angular/core';
import { AppCacheService } from '@yuuvis/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private STORAGE_KEY = 'yuv.framework.layout';
  private layoutSettings: LayoutSettings = {};
  private layoutSettingsSource = new ReplaySubject<LayoutSettings>();
  public layoutSettings$: Observable<LayoutSettings> = this.layoutSettingsSource.asObservable();

  constructor(private appCache: AppCacheService) {
    // load saved settings
    this.appCache.getItem(this.STORAGE_KEY).subscribe(settings => {
      this.layoutSettings = settings || {};
      this.processLayoutSettings();
    });
  }

  private processLayoutSettings() {
    this.setDarkMode(this.layoutSettings.darkMode);
  }

  getLayoutSettings() {
    return this.layoutSettings;
  }

  setDarkMode(darkMode: boolean) {
    this.layoutSettings.darkMode = darkMode;
    this.saveSettings();
  }

  private saveSettings() {
    this.appCache.setItem(this.STORAGE_KEY, this.layoutSettings).subscribe();
    this.layoutSettingsSource.next(this.layoutSettings);
  }
}

export interface LayoutSettings {
  darkMode?: boolean;
}
