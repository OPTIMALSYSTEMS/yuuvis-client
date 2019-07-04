import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SafeHtmlPipe} from './safe-html.pipe';
import {KeysPipe} from './keys.pipe';
import {LocaleCurrencyPipe, LocalePercentPipe, LocaleDecimalPipe, LocaleNumberPipe} from './locale-number.pipe';
import {LocaleDatePipe} from './locale-date.pipe';
import {FileSizePipe} from './filesize.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
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
export class PipesModule {
}
