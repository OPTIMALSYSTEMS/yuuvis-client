import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvGroupedSelectModule } from '../grouped-select/grouped-select.module';
import { YuvSearchModule } from '../search/search.module';
import { ObjectPickerComponent } from './object-picker/object-picker.component';

@NgModule({
  declarations: [ObjectPickerComponent],
  exports: [ObjectPickerComponent],
  imports: [CommonModule, YuvCommonModule, YuvSearchModule, YuvComponentsModule, YuvGroupedSelectModule]
})
export class YuvObjectPickerModule {}
