import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Selectable, SelectableGroup } from '../../grouped-select';
/**
 * @ignore
 */
@Component({
  selector: 'yuv-column-picker',
  templateUrl: './column-picker.component.html',
  styleUrls: ['./column-picker.component.scss']
})
export class ColumnPickerComponent {
  @Input() groups: SelectableGroup[];
  @Output() select = new EventEmitter<Selectable[]>();
  @Output() cancel = new EventEmitter<any>();

  selectedItems: Selectable[];

  constructor() {}

  onGroupItemSelect(selection: Selectable[]) {
    this.selectedItems = selection;
    this.emitSelection();
  }

  emitSelection() {
    this.select.emit(this.selectedItems);
  }

  onCancel() {
    this.cancel.emit();
  }
}
