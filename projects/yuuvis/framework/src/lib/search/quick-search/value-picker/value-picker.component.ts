import { Component } from '@angular/core';

@Component({
  selector: 'yuv-value-picker',
  templateUrl: './value-picker.component.html',
  styleUrls: ['./value-picker.component.scss']
})
export class ValuePickerComponent {
  // export class ValuePickerComponent implements OnInit, AfterViewInit {
  // @ViewChildren(ValuePickerItemComponent) itemElements: QueryList<ValuePickerItemComponent>;
  // @Input() items: ValuePickerItem[]; // | ValuePickerGroup[];
  // @Input() selectedItemIds: string[];
  // @Input() set multiselect(m: boolean) {
  //   this.isMultiple = m;
  // }
  // get multiselect() {
  //   return this.isMultiple;
  // }
  // @Output() select = new EventEmitter<any>();
  // @Output() cancel = new EventEmitter<any>();
  // private keyManager: ActiveDescendantKeyManager<ValuePickerItemComponent>;
  // @HostBinding('class.multiple') isMultiple: boolean;
  // selection = {};
  // constructor(private elRef: ElementRef) {}
  // onKeydown(event) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   if (this.multiselect) {
  //     if (event.keyCode === ENTER) {
  //       if (this.keyManager.activeItem) {
  //         if (!Object.keys(this.selection).length) {
  //           this.addToSelection(this.keyManager.activeItem.item);
  //         }
  //         this.emitSelection();
  //       }
  //     } else if (event.keyCode === SPACE) {
  //       this.addToSelection(this.keyManager.activeItem.item);
  //     } else {
  //       this.keyManager.onKeydown(event);
  //     }
  //   } else {
  //     if (event.keyCode === ENTER) {
  //       if (this.keyManager.activeItem) {
  //         this.addToSelection(this.keyManager.activeItem.item);
  //         this.emitSelection();
  //       }
  //     } else if (event.keyCode !== SPACE) {
  //       this.keyManager.onKeydown(event);
  //     }
  //   }
  // }
  // onClick(item: ValuePickerItem) {
  //   this.selection = {};
  //   this.selection[item.id] = item;
  //   this.emitSelection();
  // }
  // onCheckboxChange(v: boolean, item: ValuePickerItem) {
  //   if (v) {
  //     this.selection[item.id] = item;
  //   } else {
  //     delete this.selection[item.id];
  //   }
  //   if (!this.multiselect) {
  //     this.emitSelection();
  //   }
  // }
  // emitCancel() {
  //   this.cancel.emit();
  // }
  // addToSelection(item) {
  //   if (!this.selection[item.id]) {
  //     this.selection[item.id] = item;
  //   } else {
  //     delete this.selection[item.id];
  //   }
  // }
  // hasSelection() {
  //   return Object.keys(this.selection).length > 0;
  // }
  // emitSelection() {
  //   const res = [];
  //   Object.keys(this.selection).forEach(k => {
  //     res.push(this.selection[k].value);
  //   });
  //   if (this.multiselect) {
  //     this.select.emit(res);
  //   } else {
  //     this.select.emit(res.length ? res[0] : []);
  //   }
  //   this.selection = {};
  // }
  // ngOnInit() {
  //   if (this.selectedItemIds) {
  //     this.items
  //       .filter(i => this.selectedItemIds.includes(i.id))
  //       .forEach(i => {
  //         this.selection[i.id] = i;
  //       });
  //   }
  // }
  // ngAfterViewInit() {
  //   this.keyManager = new ActiveDescendantKeyManager(this.itemElements).withWrap().withTypeAhead();
  //   this.itemElements.first.focus();
  // }
}

// export interface ValuePickerItem {
//   id: string;
//   label: string;
//   value: any;
// }
// export interface ValuePickerGroup {
//   id: string;
//   label: string;
//   items: ValuePickerItem[];
// }
