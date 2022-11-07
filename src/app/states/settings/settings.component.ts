import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppCacheService, BackendService, ConfigService, SystemService, TranslateService, UserConfigService, UserService, YuvUser } from '@yuuvis/core';
import { arrowDown, IconRegistryService, LayoutService, LayoutSettings, NotificationService, PluginsService } from '@yuuvis/framework';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';

import { dashboard, dashboardWidget, shield } from '../../../assets/default/svg/svg';
import { AppService } from '../../app.service';

@Component({
  selector: 'yuv-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  user$: Observable<Partial<YuvUser>>;
  darkMode: boolean;
  accentColor: string;
  enableDashboardTypeSettings: boolean = false;
  dashboardType: 'default' | 'widgets' = 'default';
  customDashboardBackground: boolean;
  clientLocales: any;
  showPermissions: boolean;
  bgImageSet: boolean;
  enableConfig: any = false;

  accentColorRGB = ['255,152,0', '120,144,156', '124,179,66', '3,169,244', '126,87,194', '236,64,122'];
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

  private reload = () => window.confirm('Application requires reload!') && window.location.reload();

  get disabledPlugins() {
    return this.pluginsService.customPlugins?.disabled;
  }

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private layoutService: LayoutService,
    private systemService: SystemService,
    private cacheService: AppCacheService,
    public config: ConfigService,
    private userConfig: UserConfigService,
    private userService: UserService,
    private backend: BackendService,
    private iconRegistry: IconRegistryService,
    private notificationService: NotificationService,
    private pluginsService: PluginsService,
    private appService: AppService
  ) {
    this.iconRegistry.registerIcons([shield, dashboard, dashboardWidget, arrowDown]);
    this.enableDashboardTypeSettings = this.config.get('core.features.dashboardWorkspaces');
    this.clientLocales = config.getClientLocales();
    this.enableConfig = this.route.snapshot.queryParamMap.get('config');
    this.enableConfig === 'old' && (ConfigService.GLOBAL_RESOURCES_PATH = (section) => UserService.GLOBAL_SETTINGS + encodeURIComponent(section));
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

  setDashboardType(dType: 'default' | 'widgets') {
    this.appService.setDashboardConfig({ dashboardType: dType });
  }

  setBackgroundImage(e) {
    this.layoutService.setDashboardBackground(!!e ? e : null);
    this.bgImageSet = true;
    setTimeout(() => {
      this.bgImageSet = false;
    }, 1000);
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

  importPluginConfig(e: any, global = false) {
    const uri = global ? PluginsService.SYSTEM_RESOURCES_CONFIG : PluginsService.ADMIN_RESOURCES_CONFIG;
    this.userConfig.importMainConfig(e, uri, !global).subscribe(() => this.reload());
  }

  exportPluginConfig() {
    this.userConfig.exportMainConfig('tenant_plugins.json', PluginsService.ADMIN_RESOURCES_CONFIG);
  }

  exportDefaultPluginConfig() {
    this.userConfig.exportMainConfig('system_plugins.json', PluginsService.SYSTEM_RESOURCES_CONFIG);
  }

  importMainConfig(e: any) {
    this.userConfig.importMainConfig(e).subscribe(() => this.reload());
  }

  exportMainConfig() {
    this.userConfig.exportMainConfig();
  }

  exportDefaultMainConfig() {
    this.backend.download('assets/default/config/main.json', 'main.json');
  }

  importLanguage(e: any, iso) {
    this.userConfig.importLanguage(e, iso).subscribe(() => this.reload());
  }

  exportLanguage(iso) {
    this.userConfig.exportLanguage(iso);
  }

  exportDefaultLanguage(iso) {
    this.backend.download(`assets/default/i18n/${iso}.json`, `${iso}.json`);
  }

  disablePlugins(disabled = true) {
    this.pluginsService.disableCustomPlugins(disabled).subscribe(() => this.reload());
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
    this.appService.dashboardConfig$.pipe(takeUntilDestroy(this)).subscribe({
      next: (res) => {
        this.dashboardType = res?.dashboardType || 'default';
      }
    });
    this.user$ = this.userService.user$.pipe(map((user) => ({ ...user, authorities: user.authorities.sort() })));
    this.layoutService.layoutSettings$.subscribe((settings: LayoutSettings) => {
      this.darkMode = settings.darkMode;
      this.accentColor = settings.accentColor;
      this.customDashboardBackground = !!settings.dashboardBackground;
    });
  }

  ngOnDestroy(): void {}
}
