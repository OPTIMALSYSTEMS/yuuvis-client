import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ValuePickerItemComponent } from './value-picker-item/value-picker-item.component';

@Component({
  selector: 'yuv-value-picker',
  templateUrl: './value-picker.component.html',
  styleUrls: ['./value-picker.component.scss']
})
export class ValuePickerComponent implements OnInit, AfterViewInit {
  @ViewChildren(ValuePickerItemComponent) itemElements: QueryList<ValuePickerItemComponent>;
  // _items;
  @Input() items: ValuePickerItem[];
  // @Input() set items(items: ValuePickerItem[]) {
  //   this._items = items.map(i => ({
  //     id: Utils.uuid(),
  //     label: i.label,
  //     value: i.value
  //   }));
  // }
  @Input() selectedItemIds: string[];
  @Input() multiselect: boolean;
  @Output() select = new EventEmitter<any>();
  private keyManager: ActiveDescendantKeyManager<ValuePickerItemComponent>;
  // private keyManager: FocusKeyManager<ValuePickerItemComponent>;

  selection = {};

  constructor(private elRef: ElementRef) {}

  onKeydown(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.multiselect) {
      if (event.keyCode === ENTER) {
        if (!Object.keys(this.selection).length) {
          this.addToSelection(this.keyManager.activeItem.item);
        }
        this.emitSelection();
      } else if (event.keyCode === SPACE) {
        this.addToSelection(this.keyManager.activeItem.item);
      } else {
        this.keyManager.onKeydown(event);
      }
    } else {
      if (event.keyCode === ENTER) {
        this.addToSelection(this.keyManager.activeItem.item);
        this.emitSelection();
      } else {
        this.keyManager.onKeydown(event);
      }
    }
  }

  clickSelect(item) {
    this.addToSelection(item);
    if (!this.multiselect) {
      this.emitSelection();
    }
  }

  addToSelection(item) {
    if (!this.selection[item.id]) {
      this.selection[item.id] = item;
    } else {
      delete this.selection[item.id];
    }
  }

  emitSelection() {
    const res = [];
    Object.keys(this.selection).forEach(k => {
      res.push(this.selection[k].value);
    });
    if (this.multiselect) {
      this.select.emit(res);
    } else {
      this.select.emit(res.length ? res[0] : []);
    }
    this.selection = {};
  }

  ngOnInit() {
    if (this.selectedItemIds) {
      this.items
        .filter(i => this.selectedItemIds.includes(i.id))
        .forEach(i => {
          this.selection[i.id] = i;
        });
    }
  }
  ngAfterViewInit() {
    this.keyManager = new ActiveDescendantKeyManager(this.itemElements).withWrap().withTypeAhead();
    // this.keyManager = new FocusKeyManager(this.itemElements).withWrap();
    console.log('FOCUS');
    this.itemElements.first.focus();
  }
}

export interface ValuePickerItem {
  id: string;
  label: string;
  value: any;
}
