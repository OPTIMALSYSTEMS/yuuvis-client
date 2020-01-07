import { Attribute, Component, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Selectable, SelectableGroup } from './grouped-select.interface';

/**
 * Component for selecting an entry from a set of grouped items. Selectable items are
 * assigned to groups and will be selectable using mouse or keyboard.
 */
@Component({
  selector: 'yuv-grouped-select',
  templateUrl: './grouped-select.component.html',
  styleUrls: ['./grouped-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GroupedSelectComponent),
      multi: true
    }
  ]
})
export class GroupedSelectComponent implements ControlValueAccessor {
  @HostListener('keydown.Enter') onEnter() {
    if (this.multiple) {
      if (this.selectedItems.length === 0) {
        this.selectedItems = [this.focusedItem];
      }
    } else {
      this.selectedItems = [this.focusedItem];
    }
    this.propagateChange(this.selectedItems);
  }

  /**
   * Array of `SelectableGroup` items, that contain the actual `Selectables`.
   */
  @Input() groups: SelectableGroup[];
  @Input() columnWidth: number = 200;
  @Input() minItemsPerColumn: number = 3;

  multiple: boolean;
  autofocus: boolean;
  selectedGroup: SelectableGroup;

  private selectedItems: Selectable[] = [];
  private focusedItem: Selectable;

  private sizeSource = new Subject<{ width: number; height: number }>();
  private resized$: Observable<{ width: number; height: number }> = this.sizeSource.asObservable();

  constructor(@Attribute('multiple') multiple: string, @Attribute('autofocus') autofocus: string) {
    this.multiple = multiple === 'true' ? true : false;
    this.autofocus = autofocus === 'true' ? true : false;

    this.resized$.pipe(debounceTime(500)).subscribe(v => {
      let c = 1;
      if (v.width > 2 * this.columnWidth && v.width < 3 * this.columnWidth) {
        c = 2;
      }
      if (v.width > 3 * this.columnWidth) {
        c = 3;
      }

      const minItems = (c - 1) * this.minItemsPerColumn;
      this.groups.forEach(g => {
        g.columns = g.items.length >= minItems ? c : c - 1;
      });
    });
  }

  itemSelected(selected: boolean, item: Selectable) {
    if (this.multiple) {
      if (selected) {
        this.selectedItems.push(item);
      } else {
        this.selectedItems = this.selectedItems.filter(i => i.label !== item.label);
      }
    } else {
      this.selectedItems = [item];
    }
    this.propagateChange(this.selectedItems);
  }

  isSelected(item): boolean {
    return this.selectedItems ? !!this.selectedItems.find(i => i.label === item.label) : false;
  }

  itemFocused(item) {
    this.focusedItem = item;
  }

  onContainerResized(event) {
    this.sizeSource.next({
      width: event.newWidth,
      height: event.newHeight
    });
  }

  propagateChange = (_: any) => {};

  writeValue(value: Selectable[]): void {
    this.selectedItems = value === undefined ? [] : value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}
}
