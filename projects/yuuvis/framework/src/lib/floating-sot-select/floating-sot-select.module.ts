import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common';
import { FloatingSotSelectItemComponent } from './floating-sot-select/floating-sot-select-item/floating-sot-select-item.component';
import { FloatingSotSelectComponent } from './floating-sot-select/floating-sot-select.component';

@NgModule({
  declarations: [FloatingSotSelectComponent, FloatingSotSelectItemComponent],
  imports: [CommonModule, YuvCommonModule, TranslateModule],
  exports: [FloatingSotSelectComponent]
})
export class YuvFloatingSotSelectModule {}
