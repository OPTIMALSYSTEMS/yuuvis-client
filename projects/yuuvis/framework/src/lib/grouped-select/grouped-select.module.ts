import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { AngularResizedEventModule } from 'angular-resize-event';
import { YuvFormModule } from './../form/form.module';
import { GroupedSelectComponent } from './grouped-select/grouped-select.component';
import { SelectableItemComponent } from './grouped-select/selectable-item/selectable-item.component';

/**
 * Module providing `GroupedSelectComponent`.
 */
@NgModule({
  declarations: [GroupedSelectComponent, SelectableItemComponent],
  exports: [GroupedSelectComponent],
  imports: [CommonModule, YuvFormModule, FormsModule, A11yModule, AngularResizedEventModule, TranslateModule, YuvCommonUiModule]
})
export class YuvGroupedSelectModule {}
