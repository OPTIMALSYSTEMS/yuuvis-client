import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { PanelModule } from 'primeng/panel';
import { YuvCommonModule } from '../common/common.module';
import { YuvFormModule } from './../form/form.module';
import { GroupedSelectComponent } from './grouped-select/grouped-select.component';
import { SelectableItemComponent } from './grouped-select/selectable-item/selectable-item.component';

/**
 * Module providing `GroupedSelectComponent`.
 */
@NgModule({
  declarations: [GroupedSelectComponent, SelectableItemComponent],
  exports: [GroupedSelectComponent, SelectableItemComponent],
  imports: [CommonModule, YuvFormModule, FormsModule, A11yModule, PanelModule, TranslateModule, YuvCommonModule]
})
export class YuvGroupedSelectModule {}
