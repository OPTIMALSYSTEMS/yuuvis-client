import { CurrencyPipe, DecimalPipe, NumberSymbol, PercentPipe, getLocaleNumberSymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { getCurrentLocale } from './locale-date.pipe';

/**
 * @ignore
 */
@Pipe({
  name: 'localeDecimal',
  pure: false
})
export class LocaleDecimalPipe extends DecimalPipe implements PipeTransform {
  get lang() {
    return getCurrentLocale(this.translate.currentLang);
  }

  constructor(public translate: TranslateService) {
    super(getCurrentLocale(translate.currentLang));
  }

  public transform(value: any, digits?: string, locale?: string): string | null | any {
    return super.transform(value, digits, locale || this.lang);
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
  get lang() {
    return getCurrentLocale(this.translate.currentLang);
  }

  constructor(public translate: TranslateService) {
    super(getCurrentLocale(translate.currentLang));
  }

  public transform(value: any, digits?: string, locale?: string): string | null | any {
    return super.transform(value, digits, locale || this.lang);
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
  get lang() {
    return getCurrentLocale(this.translate.currentLang);
  }

  constructor(public translate: TranslateService) {
    super(getCurrentLocale(translate.currentLang));
  }

  public transform(
    value: any,
    currencyCode?: string,
    display?: 'code' | 'symbol' | 'symbol-narrow' | boolean,
    digits?: string,
    locale?: string
  ): string | null | any {
    return super.transform(value, currencyCode, display, digits, locale || this.lang);
  }
}

/**
 * @ignore
 */
@Pipe({
  name: 'localeNumber',
  pure: false
})
export class LocaleNumberPipe implements PipeTransform {
  decimalPipe: LocaleDecimalPipe;

  get decimalSeparator() {
    return getLocaleNumberSymbol(this.translate.currentLang, NumberSymbol.Decimal) || '.';
  }

  get separator() {
    return getLocaleNumberSymbol(this.translate.currentLang, NumberSymbol.Group) || ',';
  }

  get lang() {
    return getCurrentLocale(this.translate.currentLang);
  }

  constructor(public translate: TranslateService) {
    this.decimalPipe = new LocaleDecimalPipe(this.translate);
  }

  public transform(value: any, grouping?: boolean, pattern?: string, scale?: number, digits?: string, locale?: string): string | null {
    value = Array.isArray(value) ? value[0] : value;
    let number = this.decimalPipe.transform(value, digits, locale || this.lang);
    if (number && !grouping) {
      number = number.replace(new RegExp('\\' + this.separator, 'g'), '');
    }
    return number ? (pattern || '{{number}}').replace('{{number}}', number) : number;
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
