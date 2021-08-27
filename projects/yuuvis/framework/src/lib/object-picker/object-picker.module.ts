import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvSearchModule } from '../search/search.module';
import { ObjectPickerComponent } from './object-picker/object-picker.component';

@NgModule({
  declarations: [ObjectPickerComponent],
  exports: [ObjectPickerComponent],
  imports: [CommonModule, YuvSearchModule]
})
export class YuvObjectPickerModule {}
