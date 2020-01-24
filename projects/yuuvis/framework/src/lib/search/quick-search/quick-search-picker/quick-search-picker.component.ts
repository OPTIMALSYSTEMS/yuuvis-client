import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ObjectType, ObjectTypeField, SystemService } from '@yuuvis/core';
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

  @Input() set data(data: QuickSearchPickerData) {
    this._data = data;
    if (data) {
      this.multiselect = data.type === 'type';

      switch (data.type) {
        case 'type': {
          this.groups = this.getObjectTypeSelectables();
          break;
        }
        case 'field': {
          this.groups = this.getObjectTypeFieldSelectables();
          break;
        }
        default: {
          this.groups = [];
        }
      }

      if (data.selected) {
        this.selectedItems = [];
        this.groups.forEach(g => {
          g.items.forEach(i => {
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

  constructor(private systemService: SystemService) {}

  private getObjectTypeSelectables(): SelectableGroup[] {
    // TODO: Apply a different property to group once grouping is available
    const tmp = this._data.items.map(i => ({
      ...i,
      group: this.systemService.getLocalizedResource(`${i.id}_description`)
    }));
    const grouped = this.groupBy(tmp, 'group');
    const selectableGroups = [];
    let i = 0;
    Object.keys(grouped)
      .sort()
      .forEach(k => {
        selectableGroups.push({
          id: `${i++}`,
          label: k,
          items: grouped[k]
        });
      });
    return selectableGroups;
  }

  private getObjectTypeFieldSelectables(): SelectableGroup[] {
    return [
      {
        id: 'field',
        items: this._data.items
      }
    ];
  }

  emitSelection() {
    switch (this._data.type) {
      case 'type': {
        this.select.emit(this.selectedItems.map(i => i.value));
        break;
      }
      case 'field': {
        this.select.emit(this.selectedItems[0].value);
        break;
      }
    }
  }

  onGroupItemSelect(selection: Selectable[]) {
    this.selectedItems = selection;
    this.emitSelection();
  }

  onCancel() {
    this.cancel.emit();
  }

  onReset() {
    this.selectedItems = [];
  }

  groupBy(arr: any[], key: string) {
    return arr.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }
}

// Input data for the quick search picker component
export interface QuickSearchPickerData {
  // the type of data item provided
  // actual items based on the given type
  type: 'type' | 'field';
  items: QuickSearchPickerDataItem[];
  // array of item IDs that should be selected upfront
  selected: string[];
}

export interface QuickSearchPickerDataItem {
  id: string;
  label: string;
  description?: string;
  svg?: string;
  highlight?: boolean;
  value: ObjectType | ObjectTypeField;
}
