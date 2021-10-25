/**
 * i18n packages
 */
import { registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import localeAr from '@angular/common/locales/ar';
import localeBn from '@angular/common/locales/bn';
import localeDe from '@angular/common/locales/de';
import localeEs from '@angular/common/locales/es';
import localeExtraAr from '@angular/common/locales/extra/ar';
import localeExtraBn from '@angular/common/locales/extra/bn';
import localeExtraDe from '@angular/common/locales/extra/de';
import localeExtraEs from '@angular/common/locales/extra/es';
import localeExtraFr from '@angular/common/locales/extra/fr';
import localeExtraHi from '@angular/common/locales/extra/hi';
import localeExtraIt from '@angular/common/locales/extra/it';
import localeExtraJa from '@angular/common/locales/extra/ja';
import localeExtraKo from '@angular/common/locales/extra/ko';
import localeExtraLv from '@angular/common/locales/extra/lv';
import localeExtraPl from '@angular/common/locales/extra/pl';
import localeExtraPt from '@angular/common/locales/extra/pt';
import localeExtraRu from '@angular/common/locales/extra/ru';
import localeExtraSk from '@angular/common/locales/extra/sk';
import localeExtraUk from '@angular/common/locales/extra/uk';
import localeExtraZh from '@angular/common/locales/extra/zh';
import localeFr from '@angular/common/locales/fr';
import localeHi from '@angular/common/locales/hi';
import localeIt from '@angular/common/locales/it';
import localeJa from '@angular/common/locales/ja';
import localeKo from '@angular/common/locales/ko';
import localeLv from '@angular/common/locales/lv';
import localePl from '@angular/common/locales/pl';
import localePt from '@angular/common/locales/pt';
import localeRu from '@angular/common/locales/ru';
import localeSk from '@angular/common/locales/sk';
import localeUk from '@angular/common/locales/uk';
import localeZh from '@angular/common/locales/zh';
import { Inject } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { CoreConfig } from '../config/core-config';
import { CORE_CONFIG } from '../config/core-config.tokens';

/**
 * Loader that fetches translations based on the configured locations
 * @ignore
 */
export class EoxTranslateJsonLoader implements TranslateLoader {
  constructor(public http: HttpClient, @Inject(CORE_CONFIG) public config: CoreConfig) {
    registerLocaleData(localeDe, 'de', localeExtraDe); // German
    registerLocaleData(localeAr, 'ar', localeExtraAr); // Arabic
    registerLocaleData(localeEs, 'es', localeExtraEs); // Spanish
    registerLocaleData(localePt, 'pt', localeExtraPt); // Portuguese
    registerLocaleData(localeFr, 'fr', localeExtraFr); // French
    registerLocaleData(localeZh, 'zh', localeExtraZh); // Chinese
    registerLocaleData(localeLv, 'lv', localeExtraLv); // Latvian
    registerLocaleData(localeRu, 'ru', localeExtraRu); // Russian
    registerLocaleData(localeIt, 'it', localeExtraIt); // Italian
    registerLocaleData(localeSk, 'sk', localeExtraSk); // Slovak
    registerLocaleData(localePl, 'pl', localeExtraPl); // Polish
    registerLocaleData(localeUk, 'uk', localeExtraUk); // Ukrainian
    registerLocaleData(localeJa, 'ja', localeExtraJa); // Japanese
    registerLocaleData(localeKo, 'ko', localeExtraKo); // Korean
    registerLocaleData(localeHi, 'hi', localeExtraHi); // Hindi
    registerLocaleData(localeBn, 'bn', localeExtraBn); // Bengalese
  }

  /**
   *
   * @param string lang
   * @returns Observable<Object>
   */
  getTranslation(lang: string): Observable<Object> {
    const t = this.config.translations.map((path) => this.http.get(`${Utils.getBaseHref()}${path}${lang}.json`).pipe(catchError((e) => of({}))));
    return forkJoin(t).pipe(map((res) => res.reduce((acc, x) => Object.assign(acc, x), {})));
  }
}
