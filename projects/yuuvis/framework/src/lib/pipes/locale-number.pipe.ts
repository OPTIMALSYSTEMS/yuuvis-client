import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'localeDecimal',
  pure: false
})
export class LocaleDecimalPipe extends DecimalPipe implements PipeTransform {
  constructor(public translate: TranslateService) {
    super(translate.currentLang || 'en');
  }

  public transform(
    value: any,
    digits?: string,
    locale?: string
  ): string | null {
    if (Array.isArray(value)) {
      return value
        .map(val =>
          super.transform(
            val,
            digits,
            locale || this.translate.currentLang || 'en'
          )
        )
        .join(', ');
    }
    return super.transform(
      value,
      digits,
      locale || this.translate.currentLang || 'en'
    );
  }
}

@Pipe({
  name: 'localePercent',
  pure: false
})
export class LocalePercentPipe extends PercentPipe implements PipeTransform {
  constructor(public translate: TranslateService) {
    super(translate.currentLang || 'en');
  }

  public transform(
    value: any,
    digits?: string,
    locale?: string
  ): string | null {
    return super.transform(
      value,
      digits,
      locale || this.translate.currentLang || 'en'
    );
  }
}

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
  ): string | null {
    return super.transform(
      value,
      currencyCode,
      display,
      digits,
      locale || this.translate.currentLang || 'en'
    );
  }
}

@Pipe({
  name: 'localeNumber',
  pure: false
})
export class LocaleNumberPipe implements PipeTransform, OnDestroy {
  decimalPipe;
  decimalSeparator = '.';
  separator = ',';
  private langChangeSubscription: Subscription;

  constructor(public translate: TranslateService) {
    this.decimalPipe = new LocaleDecimalPipe(this.translate);
    this.updateSeparators(this.translate.currentLang);
    this.langChangeSubscription = this.translate.onLangChange.subscribe(
      currLang => this.updateSeparators(currLang.lang)
    );
  }

  public transform(
    value: any,
    grouping?: boolean,
    pattern?: string,
    scale?: number,
    digits?: string,
    locale?: string
  ): string | null {
    let str = this.decimalPipe.transform(value, digits, locale);
    if (!grouping) {
      str = str.replace(new RegExp('\\' + this.separator, 'g'), '');
    }
    return (pattern || '{{number}}').replace('{{number}}', str);
  }

  private updateSeparators(lang: string) {
    if (lang) {
      const pattern = this.decimalPipe.transform(1111.11, '1.2-2', lang);
      this.decimalSeparator = pattern[5];
      this.separator = pattern[1];
    }
  }

  stringToNumber(value: string) {
    value = (value || '')
      .replace(new RegExp('\\' + this.separator, 'g'), '')
      .replace(this.decimalSeparator, '.');
    if (
      typeof value === 'string' &&
      !isNaN(Number(value) - parseFloat(value))
    ) {
      return Number(value);
    }
    return NaN;
  }

  numberToString(
    value: number,
    grouping?: boolean,
    pattern?: string,
    scale?: number
  ) {
    scale = typeof scale === 'number' ? scale : 2;
    return this.transform(
      value,
      grouping,
      pattern,
      scale,
      `1.${scale}-${scale}`
    );
  }

  ngOnDestroy() {
    this.langChangeSubscription.unsubscribe();
  }
}
