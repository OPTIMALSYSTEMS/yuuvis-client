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
    this.translate.setDefaultLang(this.getDefaultClientLocale());
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
