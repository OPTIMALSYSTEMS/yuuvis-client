import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YuvFormModule } from './../form/form.module';
import { GroupedSelectComponent } from './grouped-select/grouped-select.component';
import { SelectableGroupComponent } from './grouped-select/selectable-group/selectable-group.component';
import { SelectableItemComponent } from './grouped-select/selectable-item/selectable-item.component';

@NgModule({
  declarations: [GroupedSelectComponent, SelectableGroupComponent, SelectableItemComponent],
  exports: [GroupedSelectComponent],
  imports: [CommonModule, YuvFormModule, FormsModule]
})
export class YuvGroupedSelectModule {}
