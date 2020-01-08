import { FocusKeyManager } from '@angular/cdk/a11y';
import { AfterViewInit, Attribute, Component, ElementRef, forwardRef, HostBinding, HostListener, Input, QueryList, ViewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, timer } from 'rxjs';
import { debounce, tap } from 'rxjs/operators';
import { Selectable, SelectableGroup, SelectableGroupInternal, SelectableInternal } from './grouped-select.interface';
import { SelectableItemComponent } from './selectable-item/selectable-item.component';

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
export class GroupedSelectComponent implements AfterViewInit, ControlValueAccessor {
  @ViewChildren(SelectableItemComponent) items: QueryList<SelectableItemComponent>;
  private keyManager: FocusKeyManager<SelectableItemComponent>;
  private _selectableItemIndex = -1;
  private _groups: SelectableGroupInternal[];

  @HostListener('keydown.Enter') onEnter() {
    if (this.multiple) {
      if (this.selectedItems.length === 0) {
        this.selectedItems = [this.focusedItem];
      }
    } else {
      this.selectedItems = [this.focusedItem];
    }
    // this.selectedItems = [this.focusedItem];
    this.propagateChange(this.selectedItems);
  }

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    this.keyManager.onKeydown(event);
  }

  /**
   * Array of `SelectableGroup` items, that contain the actual `Selectables`.
   */
  @Input() set groups(groups: SelectableGroup[]) {
    this._groups = groups;
  }
  get groups() {
    return this._groups;
  }
  @Input() columnWidth: number = 200;
  @Input() minItemsPerColumn: number = 3;

  get selectableItemIndex(): number {
    return this._selectableItemIndex++;
  }

  @HostBinding('class.multiple') multiple: boolean;
  autofocus: boolean;
  // selectedGroup: SelectableGroup;

  private selectedItems: Selectable[] = [];
  private focusedItem: Selectable;
  private resizeDebounce = 0;

  private sizeSource = new Subject<{ width: number; height: number }>();
  private resized$: Observable<{ width: number; height: number }> = this.sizeSource.asObservable();

  constructor(@Attribute('multiple') multiple: string, @Attribute('autofocus') autofocus: string, private elRef: ElementRef) {
    this.multiple = multiple === 'true' ? true : false;
    this.autofocus = autofocus === 'true' ? true : false;

    this.resized$
      .pipe(
        debounce(() => {
          return timer(this.resizeDebounce);
        }),
        tap(() => {
          this.resizeDebounce = 500;
        })
      )
      .subscribe(v => {
        let c = 1;
        if (v.width > 2 * this.columnWidth && v.width < 3 * this.columnWidth) {
          c = 2;
        }
        if (v.width > 3 * this.columnWidth) {
          c = 3;
        }

        const minItems = (c - 1) * this.minItemsPerColumn;
        this._groups.forEach(g => {
          g.columns = g.items.length >= minItems ? c : c - 1;
        });
      });
  }

  groupFocused(group: SelectableGroup) {
    const innerIdx = group.items.map((g: SelectableInternal) => g.index);
    // const idx = (group.items[0] as SelectableInternal).index;
    if (!innerIdx.includes(this.keyManager.activeItemIndex)) {
      this.keyManager.setActiveItem(innerIdx[0]);
    }
  }

  itemSelected(selected: boolean, item: SelectableInternal) {
    if (this.multiple) {
      if (selected) {
        this.selectedItems.push(item);
      } else {
        this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
      }
    } else {
      this.selectedItems = [item];
    }
    this.propagateChange(this.selectedItems);
  }

  itemClicked(item: SelectableInternal) {
    this.keyManager.updateActiveItemIndex(item.index);
  }

  isSelected(item): boolean {
    return this.selectedItems ? !!this.selectedItems.find(i => i.id === item.id) : false;
  }

  itemFocused(item: SelectableInternal) {
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

  ngAfterViewInit() {
    this.keyManager = new FocusKeyManager(this.items).withWrap();
    let i = 0;
    this.items.forEach((c: SelectableItemComponent) => (c._item.index = i++));
    if (this.autofocus && this.groups.length > 0) {
      this.elRef.nativeElement.querySelector('.group').focus();
    }
  }
}
