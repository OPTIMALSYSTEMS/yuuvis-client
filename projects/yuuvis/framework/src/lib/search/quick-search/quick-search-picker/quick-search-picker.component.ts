import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class QuickSearchPickerComponent implements OnInit {
  @Input() items: SelectableGroup[];
  @Input() selectedItemIds: string[];
  @Input() multiselect: boolean;

  @Output() select = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();

  selectedItems: Selectable[];

  constructor() {}

  emitSelection() {}

  onCancel() {
    this.cancel.emit();
  }

  ngOnInit() {}
}
