import { Attribute, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Selectable, SelectableGroup } from './grouped-select.interface';

/**
 * Component for selecting an entry from a set of grouped items. Selectable items are
 * assigned to groups and will be selectable using mouse or keyboard.
 */
@Component({
  selector: 'yuv-grouped-select',
  templateUrl: './grouped-select.component.html',
  styleUrls: ['./grouped-select.component.scss']
})
export class GroupedSelectComponent implements OnInit {
  @HostListener('keydown.Enter') onEnter() {
    if (this.multiple) {
      if (this.selectedItems.length === 0) {
        this.selectedItems = [this.focusedItem];
      }
    } else {
      this.selectedItems = [this.focusedItem];
    }
    this.selectionChange.emit(this.selectedItems);
    // this.triggerSelect();
  }

  /**
   * Array of `SelectableGroup` items, that contain the actual `Selectables`.
   */
  @Input() groups: SelectableGroup[];
  multiple: boolean;

  /**
   * Emitted when selection is done. Emits a
   * `Selectable` by default and an array of `Selectables` when
   * `multiple` attribute is set to 'true'
   */
  // @Output() select = new EventEmitter<Selectable | Selectable[]>();

  /**
   * Emitted once the selection changes. Only triggered whem `multiple`
   * is set to 'true'.
   */
  @Output() selectionChange = new EventEmitter<Selectable[]>();

  private selectedItems: Selectable[] = [];
  selectedGroup: SelectableGroup;
  private focusedItem: Selectable;

  constructor(@Attribute('multiple') multiple: string) {
    this.multiple = multiple === 'true' ? true : false;
  }

  // private triggerSelect(selectables: Selectable[]) {
  //   this.select.emit(this.multiple ? selectables : selectables[0]);
  // }

  itemSelected(selected: boolean, item: Selectable) {
    if (this.multiple) {
      if (selected) {
        this.selectedItems.push(item);
      } else {
        this.selectedItems = this.selectedItems.filter(i => i.label !== item.label);
      }
    }
    console.log(this.selectedItems);
    this.selectionChange.emit(this.selectedItems);
  }

  itemFocused(item) {
    this.focusedItem = item;
  }

  // triggerSelect() {

  //   // if (this.multiple) {
  //   //   // this.triggerSelect(this.selectedItems);
  //   //   this.select.emit(this.selectedItems);
  //   // } else {
  //   //   // this.triggerSelect([this.focusedItem]);
  //   //   this.select.emit(this.focusedItem);
  //   // }
  // }

  ngOnInit() {
    console.log(this.multiple);
  }
}
