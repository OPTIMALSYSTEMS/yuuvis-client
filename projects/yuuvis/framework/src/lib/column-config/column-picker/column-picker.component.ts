import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Selectable, SelectableGroup } from '../../grouped-select';

/**
 * This component adds new columns to the result list column configuration for an object.
 *
 * [Screenshot](../assets/images/yuv-column-picker.gif)
 *
 * @example
 * <yuv-column-picker [groups]="data.groups" (cancel)="onPickerCancel(popover)" (select)="onPickerResult($event, popover)"></yuv-column-picker>
 */
@Component({
  selector: 'yuv-column-picker',
  templateUrl: './column-picker.component.html',
  styleUrls: ['./column-picker.component.scss']
})
export class ColumnPickerComponent {
  /**
   * displays a list of available items for adding to the list column configuration
   */
  @Input() groups: SelectableGroup[];

  /**
   * Emitted when the items (new columns) have been selected and saved
   * to the backend. Will emitt the updated column configuration.
   */
  @Output() select = new EventEmitter<Selectable[]>();

  /**
   * Emittet when the select event of new items has been cancelled
   */
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
