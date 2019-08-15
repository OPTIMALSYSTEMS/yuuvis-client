import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChipPipe } from './chip.pipe';
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
import { DisplayNamePipe, FullNamePipe } from './user.pipe';

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
    SafeHtmlPipe,
    DisplayNamePipe,
    FullNamePipe,
    ChipPipe
  ],
  exports: [
    FileSizePipe,
    LocaleDatePipe,
    LocaleDecimalPipe,
    LocalePercentPipe,
    LocaleCurrencyPipe,
    LocaleNumberPipe,
    KeysPipe,
    SafeHtmlPipe,
    DisplayNamePipe,
    FullNamePipe,
    ChipPipe
  ]
})
export class YuvPipesModule {}
