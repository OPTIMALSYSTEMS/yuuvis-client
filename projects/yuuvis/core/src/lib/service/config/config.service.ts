import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { ApiBase } from '../backend/api.enum';
import { EventService } from '../event/event.service';
import { YuvEventType } from '../event/events';
import { TENANT_HEADER } from '../system/system.enum';
import { OidcService } from './../auth/oidc.service';
import { YuvConfig, YuvConfigLanguages } from './config.interface';
/**
 * Load and provide configuration for hole apllication while application is inizialized.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  static GLOBAL_RESOURCES = '/resources/config/';

  static PARSER(c: any) {
    return c?.resolved || c?.tenant || c?.app || c?.global || c || {};
  }

  static GLOBAL_MAIN_CONFIG(prefix: 'system' | 'admin' | '' = '') {
    return ConfigService.GLOBAL_RESOURCES_PATH('main-config', prefix);
  }

  static GLOBAL_MAIN_CONFIG_LANG(iso = 'en', prefix: 'system' | 'admin' | '' = '') {
    return ConfigService.GLOBAL_RESOURCES_PATH('main-config-language-' + iso, prefix);
  }

  static GLOBAL_RESOURCES_PATH(section = '', prefix: 'system' | 'admin' | '' = '') {
    return (prefix ? `/${prefix}` : '') + ConfigService.GLOBAL_RESOURCES + encodeURIComponent(section) + '?filter=resolved';
  }

  get oidc() {
    return this.oidcService.config?.oidc;
  }

  private cfg: YuvConfig = null;
  /**
   * @ignore
   */
  constructor(private translate: TranslateService, private eventService: EventService, private http: HttpClient, private oidcService: OidcService) {
    this.eventService
      .on(YuvEventType.CLIENT_LOCALE_CHANGED)
      .subscribe((event: any) =>
        this.getGlobalResources(ConfigService.GLOBAL_MAIN_CONFIG_LANG(event.data)).subscribe((t) => this.extendTranslations(t, event.data))
      );
  }

  /**
   * Set during app init (see CoreInit)
   * @ignore
   */
  set(cfg: YuvConfig) {
    this.cfg = cfg;
    const languages = this.getClientLocales().map((lang) => lang.iso);
    this.translate.addLangs(languages);
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = languages.includes(browserLang) ? browserLang : this.getDefaultClientLocale();
    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
    this.extendTranslations(defaultLang);
  }

  get(configKey: string): any {
    return configKey ? Utils.getProperty(this.cfg, configKey) : null;
  }

  private mergeConfigs(configs: any[]) {
    return configs.reduce((acc, x) => {
      // merge object values on 2nd level
      Object.keys(x).forEach((k) => (!acc[k] || Array.isArray(x[k]) || typeof x[k] !== 'object' ? (acc[k] = x[k]) : Object.assign(acc[k], x[k])));
      return acc;
    }, {});
  }

  extendConfig(configs: YuvConfig[]) {
    this.cfg = this.mergeConfigs(configs || []); // preset config to resolve ApiBase
    return this.oidcService.initOpenIdConnect(this.cfg.oidc).pipe(
      switchMap((oidc) =>
        this.getGlobalResources(ConfigService.GLOBAL_MAIN_CONFIG(), ConfigService.PARSER).pipe(
          map((c: any) => [...configs, c]),
          map((configs: YuvConfig[]) => this.set(this.mergeConfigs(configs))),
          switchMap(() => (oidc ? this.setupCookie() : of({})))
        )
      )
    );
  }

  setupCookie() {
    // update cookie every 5 minutes
    setTimeout(() => this.setupCookie().subscribe(), 5 * 60 * 1000);

    const path = this.getApiBase(ApiBase.apiWeb) + ConfigService.GLOBAL_MAIN_CONFIG();
    return this.oidcService.setupCookie(this.getApiBase('viewer', true), path, this.getAuthHeaders(true));
  }

  extendTranslations(translations: any, lang = this.translate.currentLang) {
    const allKeys = translations && Object.keys(this.translate.store?.translations[lang] || {});
    if (translations && !Object.keys(translations).every((k) => allKeys.includes(k))) {
      this.translate.setTranslation(lang, translations, true);
    }
  }

  getGlobalResources(path = ConfigService.GLOBAL_MAIN_CONFIG(), parser = ConfigService.PARSER) {
    return this.http.get(this.getApiBase(ApiBase.apiWeb) + path, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of({})),
      map(parser)
    );
  }

  authUsesOpenIdConnect(): boolean {
    return !!this.oidc?.host && !!this.oidc?.tenant;
  }

  /**
   * OpenIdConnect authorization headers
   */
  getAuthHeaders(authorization = false): HttpHeaders {
    if (this.authUsesOpenIdConnect()) {
      let headers = new HttpHeaders().set(TENANT_HEADER, this.oidc.tenant);
      if (authorization) {
        headers = headers.set('authorization', 'Bearer ' + localStorage.getItem('access_token'));
      }

      return headers;
    }
    return new HttpHeaders();
  }

  /**
   * Getter for the available client locales
   * @returns available client locales
   */
  getClientLocales(): YuvConfigLanguages[] {
    return this.getCoreConfig('languages');
  }

  getApiBase(api: string = ApiBase.apiWeb, origin = false): string {
    api = api || ApiBase.none;
    const href = api === ApiBase.none ? api : this.getCoreConfig('apiBase')[api] || '/' + api;
    const host = this.oidc?.host || (origin && location.origin) || '';
    return href.startsWith('http') ? href : host + href;
  }

  /**
   * Get the default client locale
   * @returns ISO string of the locale
   */
  getDefaultClientLocale() {
    const lang = this.getClientLocales().find((_) => _.fallback);
    return lang ? lang.iso : 'en';
  }

  private getCoreConfig(key: string): any {
    return this.cfg?.core[key];
  }
}
