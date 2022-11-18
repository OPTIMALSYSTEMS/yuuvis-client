import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

/**
 * @ignore
 */
@Pipe({
  name: 'localeDecimal',
  pure: false
})
export class LocaleDecimalPipe extends DecimalPipe implements PipeTransform {
  constructor(public translate: TranslateService) {
    super(translate.currentLang || 'en');
  }

  public transform(value: any, digits?: string, locale?: string): string | null | any {
    return super.transform(value, digits, locale || this.translate.currentLang || 'en');
  }
}

/**
 * @ignore
 */
@Pipe({
  name: 'localePercent',
  pure: false
})
export class LocalePercentPipe extends PercentPipe implements PipeTransform {
  constructor(public translate: TranslateService) {
    super(translate.currentLang || 'en');
  }

  public transform(value: any, digits?: string, locale?: string): string | null | any {
    return super.transform(value, digits, locale || this.translate.currentLang || 'en');
  }
}

/**
 * @ignore
 */
@Pipe({
  name: 'localeCurrency',
  pure: false
})
export class LocaleCurrencyPipe extends CurrencyPipe implements PipeTransform {
  constructor(public translate: TranslateService) {
    super(translate.currentLang || 'en');
  }

  public transform(
    value: any,
    currencyCode?: string,
    display?: 'code' | 'symbol' | 'symbol-narrow' | boolean,
    digits?: string,
    locale?: string
  ): string | null | any {
    return super.transform(value, currencyCode, display, digits, locale || this.translate.currentLang || 'en');
  }
}

/**
 * @ignore
 */
@UntilDestroy()
@Pipe({
  name: 'localeNumber',
  pure: false
})
export class LocaleNumberPipe implements PipeTransform {
  decimalPipe;
  decimalSeparator = '.';
  separator = ',';

  constructor(public translate: TranslateService) {
    this.decimalPipe = new LocaleDecimalPipe(this.translate);
    this.updateSeparators(this.translate.currentLang);
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((currLang) => this.updateSeparators(currLang.lang));
  }

  public transform(value: any, grouping?: boolean, pattern?: string, scale?: number, digits?: string, locale?: string): string | null {
    value = Array.isArray(value) ? value[0] : value;
    let number = this.decimalPipe.transform(value, digits, locale);
    if (number && !grouping) {
      number = number.replace(new RegExp('\\' + this.separator, 'g'), '');
    }
    return number ? (pattern || '{{number}}').replace('{{number}}', number) : number;
  }

  private updateSeparators(lang: string) {
    if (lang) {
      const pattern = this.decimalPipe.transform(1111.11, '1.2-2', lang);
      this.decimalSeparator = pattern[5];
      this.separator = pattern[1];
    }
  }

  stringToNumber(value: string) {
    value = (value || '').replace(new RegExp('\\' + this.separator + "|\\s|'| ", 'g'), '').replace(this.decimalSeparator, '.');
    if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
      return Number(value);
    }
    return NaN;
  }

  numberToString(value: number, grouping?: boolean, pattern?: string, scale?: number) {
    value = Array.isArray(value) ? value[0] : value;
    scale = typeof scale === 'number' ? scale : 2;
    return this.transform(value, grouping, pattern, scale, `1.${scale}-${scale}`);
  }
}
