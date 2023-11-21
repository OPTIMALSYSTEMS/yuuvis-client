import {
  DatePipe,
  FormStyle,
  FormatWidth,
  TranslationWidth,
  getLocaleDateFormat,
  getLocaleDateTimeFormat,
  getLocaleDayPeriods,
  getLocaleDirection,
  getLocaleTimeFormat
} from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@yuuvis/core';

/**
 * This pipe transforms its input (supposed to be a date) into a more human readable format like for example 'dd.MM.yyyy'
 * @example
 *  <div>{{ creationDate | localeDate }}</div>
 *  <div>{{ creationDate | localeDate: 'eoShortDate' }}</div>
 *  <div>{{ creationDate | localeDate: 'eoShortTime' }}</div>
 *  <div>{{ creationDate | localeDate: 'eoNiceShort' }}</div>
 */
@Pipe({
  name: 'localeDate',
  pure: false
})
export class LocaleDatePipe extends DatePipe implements PipeTransform {
  get lang() {
    return getCurrentLocale(this.translate.currentLang);
  }

  get dayPeriods() {
    return getLocaleDayPeriods(this.lang, FormStyle.Format, TranslationWidth.Narrow) || ['AM', 'PM'];
  }

  get direction() {
    return getLocaleDirection(this.lang);
  }

  constructor(private translate: TranslateService) {
    super(getCurrentLocale(translate.currentLang));
  }

  transform(value: any, format: string = '', timezone?: string, locale?: string): string | null | any {
    value = Array.isArray(value) ? value[0] : value;
    if (format === 'eoNiceShort') {
      const diff = (new Date(value).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 1000 / 3600 / 24;
      format = diff === 0 ? 'eoShortTime' : diff > -7 && diff < 0 ? 'eoShortDayTime' : format;
    }

    let formatValue = super.transform(this.fixTimezone(value), this.format(format || 'eoShort'), timezone, locale || this.lang);
    formatValue = dateTransformers.reduce((value, fn) => fn.call(this, value, format), formatValue);

    return formatValue;
  }

  /**
   * fix the timezone offset
   * @param value
   * @returns
   * */
  fixTimezone(value: any): Date {
    const date = value && new Date(value);
    return value?.length === 10 ? new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000) : date;
  }

  /**
   * parse the date based on the given format
   * @param value
   * @param format
   * @returns
   */
  parse(value: string, format: string = 'yyyy-MM-dd') {
    const numbers = value?.match(/\d+/g);
    const keys = format?.match(/[mMdyhH]+/g);
    const m = numbers?.length === keys?.length && keys?.reduce((p, c, i) => ({ ...p, [c[0]]: numbers[i] }), {});
    const ampm = this.parseAmPm(value, format);

    return m && ampm
      ? new Date(`${m['y']}-${m['M']}-${m['d']}
                  ${m['m'] ? ' ' + (m['h'] || m['H']) + ':' + m['m'] + ' ' + ampm.replace('*', '') : ''}`)
      : undefined;
  }

  /**
   * parse the am/pm part of the date
   * @param value
   * @param format
   * @returns
   * */

  parseAmPm(value: string, format: string = 'yyyy-MM-dd'): 'am' | 'pm' | '*' {
    return !format?.match('a')
      ? '*'
      : value?.match(/aa|ma|Ma/)
      ? undefined
      : value?.match(new RegExp(this.dayPeriods[1] + '|pm', 'i'))
      ? 'pm'
      : value?.match(new RegExp(this.dayPeriods[0] + '|am', 'i'))
      ? 'am'
      : undefined;
  }

  /**
   * format the date based on the given format
   * @param format
   * @returns
   */
  format(format?: string, skipFormatters?: boolean) {
    let formatValue = '';
    switch (format) {
      case 'eoNiceShort':
      case 'eoShortDate':
        formatValue = getLocaleDateFormat(this.lang, FormatWidth.Short);
        break;
      case 'eoShortDay':
        formatValue = 'EE';
        break;
      case 'eoShortTime':
        formatValue = getLocaleTimeFormat(this.lang, FormatWidth.Short);
        break;
      case 'eoShort':
        formatValue = getLocaleDateTimeFormat(this.lang, FormatWidth.Short)
          .replace('{0}', this.format('eoShortTime', true))
          .replace('{1}', this.format('eoShortDate', true));
        break;
      case 'eoShortDayTime':
        formatValue = getLocaleDateTimeFormat(this.lang, FormatWidth.Short)
          .replace(',', '')
          .replace('{0}', this.format('eoShortTime', true))
          .replace('{1}', this.format('eoShortDay', true));
        break;
    }

    formatValue = skipFormatters ? formatValue : dateFormatters.reduce((value, fn) => fn.call(this, value, format), formatValue);

    return formatValue || format;
  }
}

/**
 * get the current language from the browser
 * @param currentLang
 * @returns
 */
export function getCurrentLocale(currentLang: string = 'en') {
  return navigator?.language?.startsWith(currentLang || 'en') ? navigator.language : currentLang || 'en';
}

/**
 * replace all date format characters with their full version
 * @param value
 * @param format
 * @returns
 */
export function fullDateFormat(value: string, format: string) {
  return value
    .replace(/[d]+/, 'dd')
    .replace(/[M]+/, 'MM')
    .replace(/[y]+/, 'yyyy')
    .replace(/[h]+/, 'hh')
    .replace(/[H]+/, 'HH')
    .replace(/[m]+/, 'mm')
    .replace(/[a]+/, 'aa');
}

/**
 * switch to 24 hour HH:mm format if there are special characters for aa (AM/PM)
 * @param value
 * @param format
 * @returns
 */
export function preventSpecialPeriodsFormat(value: string, format: string) {
  return value.match('a') && !this.dayPeriods.join('').match(/[A-Za-z]+/) ? value.replace(/\s?a+\s?/, '').replace(/h/g, 'H') : value;
}

/**
 * reverse the pattern if the language is rtl
 * @param value
 * @param format
 * @returns
 */
export function rtlReverseFormat(value: string, format: string) {
  return this.direction === 'rtl' ? value.split('').reverse().join('') : value;
}

/**
 * transform day periods from a.m. / p.m. to am / pm
 * @param value
 * @param format
 * @returns
 */
export function preventLongPeriodsTransofrm(value: string, format: string) {
  return value?.replace(/\.(m)\./i, '$1');
}

/**
 * list of date formatter functions
 */
export const dateFormatters = [fullDateFormat, preventSpecialPeriodsFormat, rtlReverseFormat];
export const dateTransformers = [preventLongPeriodsTransofrm];
