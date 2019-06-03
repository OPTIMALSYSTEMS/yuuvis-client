import { Injectable } from '@angular/core';
import { YuvConfig } from './config.interface';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private cfg: YuvConfig = null;

  constructor(private translate: TranslateService) { }

  /**
   * Set during app init (see CoreInit)
   * @ignore
   */
  set(cfg: YuvConfig) {
    this.cfg = cfg;
    const languages = this.getClientLocales().map(lang => lang.iso);
    this.translate.addLangs(languages);
    this.translate.setDefaultLang(this.getDefaultClientLocale());
  }

  /**
   * Getter for the available client locales
   * @returns available client locales
   */
  getClientLocales(): any[] {
    return this.cfg['languages'];
  }

  getApiBase(api: string): string {
    return this.cfg['apiBase'][api];
  }

  /**
   * Get the default client locale
   * @returns ISO string of the locale
   */
  getDefaultClientLocale() {
    const lang = this.getClientLocales().find(_ => _.fallback);
    return lang ? lang.iso : 'en';
  }
}
