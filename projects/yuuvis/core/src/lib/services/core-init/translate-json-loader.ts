import {TranslateLoader} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {Inject} from '@angular/core';
import {Observable, of as observableOf, forkJoin as observableForkJoin} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

/**
 * i18n packages
 */
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeExtraDe from '@angular/common/locales/extra/de';
import localeAr from '@angular/common/locales/ar';
import localeExtraAr from '@angular/common/locales/extra/ar';
import localeEs from '@angular/common/locales/es';
import localeExtraEs from '@angular/common/locales/extra/es';
import localePt from '@angular/common/locales/pt';
import localeExtraPt from '@angular/common/locales/extra/pt';
import localeFr from '@angular/common/locales/fr';
import localeExtraFr from '@angular/common/locales/extra/fr';
import localeZh from '@angular/common/locales/zh';
import localeExtraZh from '@angular/common/locales/extra/zh';
import localeLv from '@angular/common/locales/lv';
import localeExtraLv from '@angular/common/locales/extra/lv';
import localeRu from '@angular/common/locales/ru';
import localeExtraRu from '@angular/common/locales/extra/ru';
import localeIt from '@angular/common/locales/it';
import localeExtraIt from '@angular/common/locales/extra/it';
import localeSk from '@angular/common/locales/sk';
import localeExtraSk from '@angular/common/locales/extra/sk';
import localePl from '@angular/common/locales/pl';
import localeExtraPl from '@angular/common/locales/extra/pl';
import localeUk from '@angular/common/locales/uk';
import localeExtraUk from '@angular/common/locales/extra/uk';
import localeJa from '@angular/common/locales/ja';
import localeExtraJa from '@angular/common/locales/extra/ja';
import localeKo from '@angular/common/locales/ko';
import localeExtraKo from '@angular/common/locales/extra/ko';
import localeHi from '@angular/common/locales/hi';
import localeExtraHi from '@angular/common/locales/extra/hi';
import localeBn from '@angular/common/locales/bn';
import localeExtraBn from '@angular/common/locales/extra/bn';
import { CORE_CONFIG } from '../config/core-config.tokens';
import { CoreConfig } from '../config/core-config';


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
    const t = this.config.translations.map(folder => this.http.get(`${folder}${lang}.json`)
      .pipe(
        catchError((e) => observableOf({}))
      ));
    return observableForkJoin(t).pipe(
      map((res) => {
        return res.reduce((acc, x) => Object.assign(acc, x), {})
      })
    );
  }
}
