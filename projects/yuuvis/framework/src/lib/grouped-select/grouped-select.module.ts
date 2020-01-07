import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularResizedEventModule } from 'angular-resize-event';
import { YuvFormModule } from './../form/form.module';
import { GroupedSelectComponent } from './grouped-select/grouped-select.component';
import { SelectableGroupComponent } from './grouped-select/selectable-group/selectable-group.component';
import { SelectableItemComponent } from './grouped-select/selectable-item/selectable-item.component';

@NgModule({
  declarations: [GroupedSelectComponent, SelectableGroupComponent, SelectableItemComponent],
  exports: [GroupedSelectComponent],
  imports: [CommonModule, YuvFormModule, FormsModule, A11yModule, AngularResizedEventModule]
})
export class YuvGroupedSelectModule {}
