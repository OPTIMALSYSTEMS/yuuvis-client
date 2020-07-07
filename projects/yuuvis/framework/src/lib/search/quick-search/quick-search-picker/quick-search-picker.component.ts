import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sort, Utils } from '@yuuvis/core';
import { Selectable, SelectableGroup } from './../../../grouped-select/grouped-select/grouped-select.interface';

/**
 * Internal modal picker component for choosing target object type(s) or object type fields
 * within the quick-search component.
 */
@Component({
  selector: 'yuv-quick-search-picker',
  templateUrl: './quick-search-picker.component.html',
  styleUrls: ['./quick-search-picker.component.scss']
})
export class QuickSearchPickerComponent {
  private _data: QuickSearchPickerData;

  @Input()
  set data(data: QuickSearchPickerData) {
    this._data = data;
    if (data) {
      this.multiselect = data.type === 'type';
      this.groups = data.items || [];
      this.groups.map((groupItem) => groupItem?.items.sort(Utils.sortValues('label')).sort(Utils.sortValues('value.isFolder', Sort.DESC)));

      // switch (data.type) {
      //   case 'type': {
      //     this.groups = data.items;
      //     break;
      //   }
      //   case 'field': {
      //     this.groups = this.getObjectTypeFieldSelectables();
      //     break;
      //   }
      //   default: {
      //     this.groups = [];
      //   }
      // }

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

  @Output() select = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();

  groups: SelectableGroup[];
  selectedItems: Selectable[];
  multiselect: boolean;

  constructor() {}

  emitSelection() {
    switch (this._data.type) {
      case 'type': {
        this.select.emit(this.selectedItems.map((i) => i.value));
        break;
      }
      case 'field': {
        this.select.emit(this.selectedItems[0].value);
        break;
      }
    }
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

// Input data for the quick search picker component
export interface QuickSearchPickerData {
  // the type of data item provided
  // actual items based on the given type
  type: 'type' | 'field';
  items: SelectableGroup[];
  // array of item IDs that should be selected upfront
  selected: string[];
}
