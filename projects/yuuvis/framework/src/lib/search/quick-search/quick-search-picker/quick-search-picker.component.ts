import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sort, Utils } from '@yuuvis/core';
import { Selectable, SelectableGroup } from './../../../grouped-select/grouped-select/grouped-select.interface';

/**
 * Internal modal picker component for choosing target object type(s) or object type fields
 * within the quick-search component.
 *
 * [Screenshot](../assets/images/yuv-quick-search-picker.gif)
 * 
 * @example
 *  <yuv-quick-search-picker [data]="data" (cancel)="onCancel(someParameter)"
    (select)="onSelect(firstParam, $event, secondParam)">
  </yuv-quick-search-picker>
 */
@Component({
  selector: 'yuv-quick-search-picker',
  templateUrl: './quick-search-picker.component.html',
  styleUrls: ['./quick-search-picker.component.scss']
})
export class QuickSearchPickerComponent {
  private _data: QuickSearchPickerData;
  /**
   * Input data for the quick search picker component.
   * The type of data item provided actual items based on the given type.
   */
  @Input()
  set data(data: QuickSearchPickerData) {
    this._data = data;
    if (data) {
      this.type = data.type;
      this.groups = data.items || [];
      if (this.type === 'type') {
        this.groups.map((groupItem) => groupItem?.items.sort(Utils.sortValues('label')).sort(Utils.sortValues('value.isFolder', Sort.DESC)));
      }

      if (data.selected) {
        this.selectedItems = [];
        this.groups.forEach((g) => {
          g.items.forEach((i) => {
            if (this._data.selected.includes(i.id)) {
              this.selectedItems.push(i);
            }
          });
        });
      }
    }
  }

  /**
   * Emitted, when an object type or object types have been selected.
   */
  @Output() select = new EventEmitter<Selectable[]>();

  /**
   * Emittet when a component dialog has been closed.
   */
  @Output() cancel = new EventEmitter<any>();

  groups: SelectableGroup[];
  selectedItems: Selectable[];
  type: string;

  get isType() {
    return this.type === 'type';
  }

  constructor() {}

  emitSelection() {
    this.select.emit(this.selectedItems);
  }

  onGroupItemSelect(selection: Selectable | Selectable[]) {
    this.selectedItems = Array.isArray(selection) ? selection : [selection];
    this.emitSelection();
  }

  onCancel() {
    this.cancel.emit();
  }

  onReset() {
    this.selectedItems = [];
  }
}
/**
 * Input data for the `QuickSearchPickerComponent`
 */
export interface QuickSearchPickerData {
  /**
   * the type of data item provided
   */
  /**
   * actual items based on the given type
   */
  type: 'type' | 'filter';
  items: SelectableGroup[];
  /**
   * array of item IDs that should be selected upfront
   */
  selected: string[];
}
