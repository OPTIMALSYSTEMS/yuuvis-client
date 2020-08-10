import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvGroupedSelectModule } from '../grouped-select/grouped-select.module';
import { ColumnConfigSelectComponent } from './column-config-select/column-config-select.component';
import { ColumnConfigComponent } from './column-config/column-config.component';
import { ColumnPickerComponent } from './column-picker/column-picker.component';
/**
 * `YuvColumntConfigModule` contains components related to column configuration.
 * The concept of a column configuration defines a set of columns that should be
 * shown within a search result list based on the object types that are part of
 * the result.
 */
@NgModule({
  declarations: [ColumnConfigComponent, ColumnPickerComponent, ColumnConfigSelectComponent],
  exports: [ColumnConfigComponent, ColumnConfigSelectComponent],
  imports: [YuvComponentsModule, YuvCommonModule, FormsModule, CommonModule, DragDropModule, YuvGroupedSelectModule, TranslateModule]
})
export class YuvColumnConfigModule {}
