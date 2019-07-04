import { Pipe, PipeTransform } from '@angular/core';
import { LocaleDecimalPipe } from './locale-number.pipe';

@Pipe({ name: 'fileSize' })
export class FileSizePipe extends LocaleDecimalPipe implements PipeTransform {
  transform(bytes = 0): string {
    if (bytes === 0) {
      return '0 Byte';
    }
    let k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i: number = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      super.transform(parseFloat((bytes / Math.pow(k, i)).toFixed(2))) +
      ' ' +
      sizes[i]
    );
  }
}
