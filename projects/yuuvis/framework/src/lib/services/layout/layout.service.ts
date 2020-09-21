import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AppCacheService, BackendService, ConfigService, Direction, Logger, UserService, YuvUser } from '@yuuvis/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/**
 * Makes it possible to configure the layout depending on the user's taste: makes it dark or light
 */

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private STORAGE_KEY = `${this.storageKeyPrefix}yuv.app.framework.layout`;
  private STORAGE_KEY_REGEXP = new RegExp(`^${this.storageKeyPrefix}yuv.app.`);
  private layoutSettings: LayoutSettings = {};
  private layoutSettingsSource = new ReplaySubject<LayoutSettings>();
  /**
   * Return new layout setting dipends on selected mode : light or dark
   */
  public layoutSettings$: Observable<LayoutSettings> = this.layoutSettingsSource.asObservable();

  private get storageKeyPrefix(): string {
    return this.configService.get('appPrefix') ? `${this.configService.get('appPrefix')}.` : '';
  }

  /**
   *
   * @ignore
   */
  constructor(
    @Inject(DOCUMENT) private document: any,
    private logger: Logger,
    private appCache: AppCacheService,
    private userService: UserService,
    private backend: BackendService,
    private configService: ConfigService
  ) {
    // load saved settings
    this.appCache.getItem(this.STORAGE_KEY).subscribe((settings) => this.processLayoutSettings(settings));
    this.userService.user$.subscribe((user: YuvUser) => this.applyDirection(user ? user.uiDirection : `yuv-ltr`));
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
      bodyClassList.add(`yuv-rtl`);
    } else {
      bodyClassList.remove(`yuv-rtl`);
    }
  }

  private applyLayoutSettings(settings: LayoutSettings) {
    const darkModeClass = 'dark';
    if (settings) {
      const body = this.document.getElementsByTagName('body')[0];
      const bodyClassList = body.classList;
      if (bodyClassList.contains(darkModeClass) && !settings.darkMode) {
        bodyClassList.remove(darkModeClass);
      } else if (!bodyClassList.contains(darkModeClass) && settings.darkMode) {
        bodyClassList.add(darkModeClass);
      }
    }
  }
  /**
   * get selected layout setting
   */
  getLayoutSettings() {
    return this.layoutSettings;
  }

  /**
   * set dark mode if a dark mode has been selected
   * @param darkMode - whether or not dark mode has been selected
   */
  setDarkMode(darkMode: boolean) {
    this.layoutSettings.darkMode = darkMode;
    this.saveSettings();
  }

  /**
   * Providing specific accent color dipends on selected mode setting
   * @param rgb - a color variable
   */
  setAccentColor(rgb: string) {
    this.layoutSettings.accentColor = rgb;
    this.saveSettings();
  }

  /**
   * Set selected mode to a dasboard component
   * @param dataUrl - url to your dasboard component
   */
  setDashboardBackground(dataUrl: string) {
    this.layoutSettings.dashboardBackground = dataUrl;
    this.saveSettings();
  }

  // /**
  //  * Persist component specific layout settings.
  //  * @param key Unique key
  //  * @param settings The settings required by the component
  //  */
  // saveComponentLayout(key: string, settings: any): Observable<any> {
  //   this.logger.debug(`saved component layout '${key}'`);
  //   return this.appCache.setItem(key, settings);
  // }

  // /**
  //  * Get the settings for a component
  //  * @param key Key the settings has been stored under
  //  */
  // loadComponentLayout(key: string): Observable<any> {
  //   this.logger.debug(`loaded component layout '${key}'`);
  //   return this.appCache.getItem(key);
  // }

  /**
   * Save layout options. Layout options are settings provided by components, that
   * can be persisted locally. All options relate to a host component (e.g. a state) in
   * order to save layout settings for re-appearing components without overriding them.
   * @param layoutOptionsKey Unique key for host component (e.g. 'yuv.state.object')
   * @param elementKey Unique key within the component that is going to store layout settings
   * @param value The layout settings itself
   */
  saveLayoutOptions(layoutOptionsKey: string, elementKey: string, value: any): Observable<any> {
    this.logger.debug(layoutOptionsKey ? `saving layout options for '${layoutOptionsKey}-${elementKey}'` : `layout key missing`);
    return layoutOptionsKey
      ? this.appCache.getItem(layoutOptionsKey).pipe(
          switchMap((res) => {
            const v = res || {};
            v[elementKey] = value;
            return this.appCache.setItem(layoutOptionsKey, v);
          })
        )
      : of(null);
  }
  /**
   * Load layout settings for a component.
   * @param layoutOptionsKey Unique host component key
   * @param elementKey Component key. If you do not provide a component key, you'll get all
   * the layout settings for the given host component.
   */
  loadLayoutOptions(layoutOptionsKey: string, elementKey?: string): Observable<any> {
    this.logger.debug(layoutOptionsKey ? `loading layout options for '${layoutOptionsKey}-${elementKey}'` : `layout key missing`);
    return layoutOptionsKey ? this.appCache.getItem(layoutOptionsKey).pipe(map((res) => (elementKey && res ? res[elementKey] : res))) : of(null);
  }

  private saveSettings() {
    this.appCache.setItem(this.STORAGE_KEY, this.layoutSettings).subscribe();
    this.processLayoutSettings(this.layoutSettings);
  }

  private cleanupData(data: any, filter?: (key: string) => boolean) {
    filter = filter || ((key: string) => !key.match(this.STORAGE_KEY_REGEXP));
    Object.keys(data).forEach((k) => filter(k) && delete data[k]);
    return data;
  }

  private generateStorageJsonUri() {
    return this.appCache.getStorage().pipe(
      map((data) => {
        const blob = new Blob([JSON.stringify(this.cleanupData(data), null, 2)], { type: 'text/json' });
        const uri = URL.createObjectURL(blob);
        // setTimeout(() => URL.revokeObjectURL(uri), 10000);
        return uri;
      })
    );
  }

  /**
   * make it possible for users to export their layout settings as a json file
   *
   */
  downloadLayout(filename = 'settings.json') {
    this.generateStorageJsonUri().subscribe((uri) => this.backend.download(uri, filename));
  }
  /**
   * make it possible for user to import their layout settings as a json file
   */
  uploadLayout(data: string | any) {
    const layout = this.cleanupData(typeof data === 'string' ? JSON.parse(data) : data);
    if (layout.hasOwnProperty(this.STORAGE_KEY)) {
      this.processLayoutSettings(layout[this.STORAGE_KEY]);
    }
    return this.clearLayout().pipe(switchMap(() => this.appCache.setStorage(layout)));
  }

  /**
   * make it possible for user to reset their layout settings and return to the default settings
   */
  clearLayout() {
    return this.appCache.clear((key: string) => !!key.match(this.STORAGE_KEY_REGEXP));
  }
}

/**
 * interface for providing a `LayoutService`
 */
export interface LayoutSettings {
  /**
   * change the mode of layout to dark
   */
  darkMode?: boolean;
  /**
   * set an accent color for a selected mode
   */

  accentColor?: string;
  /**
   * set a background in a dashboard
   */
  dashboardBackground?: string;
}
