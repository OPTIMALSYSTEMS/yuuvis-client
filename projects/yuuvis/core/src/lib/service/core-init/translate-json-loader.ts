/**
 * i18n packages
 */
import { registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import localeAr from '@angular/common/locales/ar';
import localeBn from '@angular/common/locales/bn';
import localeDe from '@angular/common/locales/de';
import localeDeCh from '@angular/common/locales/de-CH';
import localeEnAu from '@angular/common/locales/en-AU';
import localeEnCa from '@angular/common/locales/en-CA';
import localeEnGb from '@angular/common/locales/en-GB';
import localeEs from '@angular/common/locales/es';
import localeExtraAr from '@angular/common/locales/extra/ar';
import localeExtraBn from '@angular/common/locales/extra/bn';
import localeExtraDe from '@angular/common/locales/extra/de';
import localeExtraDeCh from '@angular/common/locales/extra/de-CH';
import localeExtraEnAu from '@angular/common/locales/extra/en-AU';
import localeExtraEnCa from '@angular/common/locales/extra/en-CA';
import localeExtraEnGb from '@angular/common/locales/extra/en-GB';
import localeExtraEs from '@angular/common/locales/extra/es';
import localeExtraFi from '@angular/common/locales/extra/fi';
import localeExtraFr from '@angular/common/locales/extra/fr';
import localeExtraHi from '@angular/common/locales/extra/hi';
import localeExtraIt from '@angular/common/locales/extra/it';
import localeExtraJa from '@angular/common/locales/extra/ja';
import localeExtraKo from '@angular/common/locales/extra/ko';
import localeExtraLv from '@angular/common/locales/extra/lv';
import localeExtraNb from '@angular/common/locales/extra/nb';
import localeExtraNl from '@angular/common/locales/extra/nl';
import localeExtraPl from '@angular/common/locales/extra/pl';
import localeExtraPt from '@angular/common/locales/extra/pt';
import localeExtraRu from '@angular/common/locales/extra/ru';
import localeExtraSk from '@angular/common/locales/extra/sk';
import localeExtraSv from '@angular/common/locales/extra/sv';
import localeExtraTh from '@angular/common/locales/extra/th';
import localeExtraTr from '@angular/common/locales/extra/tr';
import localeExtraUk from '@angular/common/locales/extra/uk';
import localeExtraVi from '@angular/common/locales/extra/vi';
import localeExtraZh from '@angular/common/locales/extra/zh';
import localeFi from '@angular/common/locales/fi';
import localeFr from '@angular/common/locales/fr';
import localeHi from '@angular/common/locales/hi';
import localeIt from '@angular/common/locales/it';
import localeJa from '@angular/common/locales/ja';
import localeKo from '@angular/common/locales/ko';
import localeLv from '@angular/common/locales/lv';
import localeNb from '@angular/common/locales/nb';
import localeNl from '@angular/common/locales/nl';
import localePl from '@angular/common/locales/pl';
import localePt from '@angular/common/locales/pt';
import localeRu from '@angular/common/locales/ru';
import localeSk from '@angular/common/locales/sk';
import localeSv from '@angular/common/locales/sv';
import localeTh from '@angular/common/locales/th';
import localeTr from '@angular/common/locales/tr';
import localeUk from '@angular/common/locales/uk';
import localeVi from '@angular/common/locales/vi';
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
    registerLocaleData(localeVi, 'vi', localeExtraVi); // Vietnamese
    registerLocaleData(localeTr, 'tr', localeExtraTr); // Turkish
    registerLocaleData(localeNl, 'nl', localeExtraNl); // Dutch
    registerLocaleData(localeNb, 'nb', localeExtraNb); // Norwegian
    registerLocaleData(localeTh, 'th', localeExtraTh); // Thai
    registerLocaleData(localeFi, 'fi', localeExtraFi); // Finnish
    registerLocaleData(localeSv, 'sv', localeExtraSv); // Swedish
    registerLocaleData(localeDeCh, 'de-CH', localeExtraDeCh); // German Swiss
    registerLocaleData(localeEnCa, 'en-CA', localeExtraEnCa); // English Canadian
    registerLocaleData(localeEnGb, 'en-GB', localeExtraEnGb); // English British
    registerLocaleData(localeEnAu, 'en-AU', localeExtraEnAu); // English Australian
  }

  /**
   *
   * @param string lang
   * @returns Observable<Object>
   */
  getTranslation(lang: string): Observable<Object> {
    const t = this.config.translations.map((path) => this.loadTranslationFile(path, lang));
    return forkJoin(t).pipe(map((res) => res.reduce((acc, x) => Object.assign(acc, x), {})));
  }

  private loadTranslationFile(path: string, lang: string): Observable<any> {
    return this.http.get(`${Utils.getBaseHref()}${path}${lang}.json`).pipe(
      catchError((e) => {
        // ISO codes with more than 2 characters are sub-languages like de-CH.
        // If there is no translation file for that sub-language we'll try to load
        // the file for the base language (in this case de).
        return lang.length > 2 ? this.loadTranslationFile(path, lang.substring(0, 2)) : of({});
      })
    );
  }
}
