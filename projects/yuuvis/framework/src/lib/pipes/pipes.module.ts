import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FileSizePipe } from './filesize.pipe';
import { KeysPipe } from './keys.pipe';
import { LocaleDatePipe } from './locale-date.pipe';
import {
  LocaleCurrencyPipe,
  LocaleDecimalPipe,
  LocaleNumberPipe,
  LocalePercentPipe
} from './locale-number.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    FileSizePipe,
    LocaleDatePipe,
    LocaleDecimalPipe,
    LocalePercentPipe,
    LocaleCurrencyPipe,
    LocaleNumberPipe,
    KeysPipe,
    SafeHtmlPipe
  ],
  exports: [
    FileSizePipe,
    LocaleDatePipe,
    LocaleDecimalPipe,
    LocalePercentPipe,
    LocaleCurrencyPipe,
    LocaleNumberPipe,
    KeysPipe,
    SafeHtmlPipe
  ]
})
export class YuvPipesModule {}
