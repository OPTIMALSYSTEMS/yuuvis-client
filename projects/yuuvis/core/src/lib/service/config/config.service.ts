import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from '../../util/utils';
import { YuvConfig, YuvConfigLanguages } from './config.interface';
/**
 * Load and provide configuration for hole apllication while application is inizialized.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  static GLOBAL_MAIN_CONFIG = '/users/globalsettings/main-config';
  static GLOBAL_MAIN_CONFIG_LANG(iso = 'en') {
    return ConfigService.GLOBAL_MAIN_CONFIG + '-language-' + iso;
  }

  private cfg: YuvConfig = null;
  /**
   * @ignore
   */
  constructor(private translate: TranslateService) {}

  /**
   * Set during app init (see CoreInit)
   * @ignore
   */
  set(cfg: YuvConfig) {
    this.cfg = cfg;
    const languages = this.getClientLocales().map((lang) => lang.iso);
    this.translate.addLangs(languages);
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = languages.includes(browserLang) ? browserLang : this.getDefaultClientLocale() || languages[0];
    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
  }

  get(configKey: string): any {
    return configKey ? Utils.getProperty(this.cfg, configKey) : null;
  }

  /**
   * Getter for the available client locales
   * @returns available client locales
   */
  getClientLocales(): YuvConfigLanguages[] {
    return this.getCoreConfig('languages');
  }

  getApiBase(api: string): string {
    return this.getCoreConfig('apiBase')[api];
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
    return this.cfg.core[key];
  }
}
