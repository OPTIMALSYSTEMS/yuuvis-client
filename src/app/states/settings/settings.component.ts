import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppCacheService, ConfigService, SystemService, TranslateService, UserConfigService, UserService, YuvUser } from '@yuuvis/core';
import { IconRegistryService, LayoutService, LayoutSettings, NotificationService } from '@yuuvis/framework';
import { forkJoin, Observable } from 'rxjs';
import { shield } from '../../../assets/default/svg/svg';

@Component({
  selector: 'yuv-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user$: Observable<YuvUser>;
  darkMode: boolean;
  accentColor: string;
  customDashboardBackground: boolean;
  clientLocales: any;

  accentColorRGB = ['255, 152, 0', '120, 144, 156', '124, 179, 66', '3,169,244', '126,87,194', '236,64,122'];
  cache = {
    system: true,
    history: true,
    layout: true
  };

  get hasManageSettingsRole() {
    return this.userService.hasManageSettingsRole;
  }

  get hasSystemRole() {
    return this.userService.hasSystemRole;
  }

  constructor(
    private translate: TranslateService,
    private router: Router,
    private layoutService: LayoutService,
    private systemService: SystemService,
    private cacheService: AppCacheService,
    private titleService: Title,
    public config: ConfigService,
    private userConfig: UserConfigService,
    private userService: UserService,
    private iconRegistry: IconRegistryService,
    private notificationService: NotificationService
  ) {
    this.iconRegistry.registerIcons([shield]);
    this.clientLocales = config.getClientLocales();
  }

  changeClientLocale(iso: string) {
    this.userService.changeClientLocale(iso);
  }

  toggleTheme(darkMode: boolean) {
    this.layoutService.setDarkMode(darkMode);
  }

  setAccentColor(rgb: string) {
    this.layoutService.setAccentColor(rgb);
  }

  setBackgroundImage(e) {
    this.layoutService.setDashboardBackground(!!e ? e : null);
  }

  downloadLayout() {
    this.layoutService.downloadLayout();
  }

  uploadLayout(e: any) {
    this.layoutService.uploadLayout(e).subscribe();
  }

  clearLayout() {
    this.layoutService.clearLayout().subscribe();
  }

  editColumnConfig() {
    this.router.navigate(['config/column-config']);
  }

  editFilterConfig(global = false) {
    this.router.navigate(['config/filter-config'], global && { queryParams: { global } });
  }

  importMainConfig(e: any) {
    this.userConfig.importMainConfig(e).subscribe(() => window.confirm('Application requires reload!') && window.location.reload());
  }

  exportMainConfig() {
    this.userConfig.exportMainConfig();
  }

  importLanguage(e: any, iso) {
    this.userConfig.importLanguage(e, iso).subscribe(() => window.confirm('Application requires reload!') && window.location.reload());
  }

  exportLanguage(iso) {
    this.userConfig.exportLanguage(iso);
  }

  clearCache() {
    const actions = [
      this.cache.history && this.cacheService.clear((key: string) => !key.startsWith('yuv.core') && !key.startsWith('yuv.app')),
      this.cache.layout && this.layoutService.clearLayout(),
      this.cache.system && this.systemService.getSystemDefinition()
    ].filter((a) => a);

    return actions.length
      ? forkJoin(actions).subscribe(
          () => this.notificationService.success(this.translate.instant('yuv.client.state.settings.cache.clear.success')),
          () => this.notificationService.error(this.translate.instant('yuv.client.state.settings.cache.clear.error'))
        )
      : false;
  }

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('yuv.client.state.settings.title'));
    this.user$ = this.userService.user$;
    this.layoutService.layoutSettings$.subscribe((settings: LayoutSettings) => {
      this.darkMode = settings.darkMode;
      this.accentColor = settings.accentColor;
      this.customDashboardBackground = !!settings.dashboardBackground;
    });
  }
}
