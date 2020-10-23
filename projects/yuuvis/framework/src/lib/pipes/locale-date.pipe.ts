import { DatePipe, FormatWidth, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleTimeFormat } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@yuuvis/core';

/**
 * This pipe transforms its input (supposed to be a date) into a more human readable format like for example 'dd.MM.yyyy'
 * @example
 *  <div>{{ creationDate | localeDate: 'shortDate' }}</div>
 */
@Pipe({
  name: 'localeDate',
  pure: false
})
export class LocaleDatePipe extends DatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {
    super(translate.currentLang);
  }

  get lang() {
    return this.translate.currentLang;
  }

  transform(value: any, format: string = '', timezone?: string, locale?: string): string {
    value = Array.isArray(value) ? value[0] : value;
    if (format === 'eoNiceShort') {
      const diff = (new Date(value).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 1000 / 3600 / 24;
      format = diff === 0 ? 'eoShortTime' : diff > -7 && diff < 0 ? 'eoShortDayTime' : format;
    }
    return super.transform(value, this.format(format || 'eoShort'), timezone, locale || this.lang);
  }

  format(format?: string) {
    let formatValue = '';
    switch (format) {
      case 'eoNiceShort':
      case 'eoShortDate':
        formatValue = getLocaleDateFormat(this.lang, FormatWidth.Short).replace(/[d]+/, 'dd').replace(/[M]+/, 'MM').replace(/[y]+/, 'yyyy');
        break;
      case 'eoShortDay':
        formatValue = 'EE';
        break;
      case 'eoShortTime':
        formatValue = getLocaleTimeFormat(this.lang, FormatWidth.Short).replace(/[h]+/, 'hh').replace(/[H]+/, 'HH').replace(/[m]+/, 'mm').replace(/[a]+/, 'aa');
        break;
      case 'eoShort':
        formatValue = getLocaleDateTimeFormat(this.lang, FormatWidth.Short)
          .replace('{0}', this.format('eoShortTime'))
          .replace('{1}', this.format('eoShortDate'));
        break;
      case 'eoShortDayTime':
        formatValue = getLocaleDateTimeFormat(this.lang, FormatWidth.Short)
          .replace(',', '')
          .replace('{0}', this.format('eoShortTime'))
          .replace('{1}', this.format('eoShortDay'));
        break;
    }

    return formatValue || format;
  }
}
