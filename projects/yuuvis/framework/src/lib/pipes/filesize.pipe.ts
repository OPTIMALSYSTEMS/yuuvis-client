import { Pipe, PipeTransform } from '@angular/core';
import { LocaleNumberPipe } from './locale-number.pipe';

@Pipe({ name: 'fileSize' })
export class FileSizePipe extends LocaleNumberPipe implements PipeTransform {
  private k = 1024;
  private sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  transform(bytes = 0): string {
    if (bytes <= 1) {
      return bytes === 1 ? '1 Byte' : '0 Bytes';
    }
    let i: number = Math.floor(Math.log(bytes) / Math.log(this.k));
    return super.transform(parseFloat((bytes / Math.pow(this.k, i)).toFixed(2))) + ' ' + this.sizes[i];
  }

  stringToNumber(value: string) {
    const sizes = this.sizes.map(s => s.toLowerCase());
    const match = value.toLowerCase().match(new RegExp(`(.*)(${sizes.join('|')})`));
    const number = super.stringToNumber((match ? match[1] : value).trim());
    return isNaN(number) ? number : number * Math.pow(1024, match ? sizes.indexOf(match[2]) : 0);
  }
}
