import { FocusKeyManager } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  Attribute,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, timer } from 'rxjs';
import { debounce, tap } from 'rxjs/operators';
import { Selectable, SelectableGroup, SelectableInternal } from './grouped-select.interface';
import { SelectableItemComponent } from './selectable-item/selectable-item.component';

/**
 * Component for selecting a single or multiple entries from a set of grouped items. This component is implementing '**ControlValueAccessor**' so you can
 * also use it within Angular forms.
 *
 * > Setting the components **multiple** input to **true** will enable the selection of more than one item.
 * > In this case using the SPACE key on a focused entry or clicking the items checkbox will add or remove the
 * > item from the current selection and propagate this change.
 * > Clicking the label of an item will immediately reset the selection to the
 * > current item only. Hitting ENTER will also immediately select one item as long as there are no other items selected.
 *
 * @example
 * <yuv-grouped-select [groups]="groups" [multiple]="true"></yuv-grouped-select>
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
  private _groups: SelectableGroup[];

  @HostListener('keydown.Enter') onEnter() {
    if (this.multiple) {
      // Setting the selection to the focused item should only happen, when nothing else
      // has been selected so far. Otherwise ENTER is supposed to submit forms this component
      // is maybe a part off.
      if (this.selectedItems.length === 0) {
        this.selectedItems = [this.focusedItem];
      }
    } else {
      this.selectedItems = [this.focusedItem];
    }
    this.propagateChange(this.selectedItems);
    // Hitting ENTER will in any case trigger the select event, that
    // 'approves' the current selection.
    this.select.emit(this.selectedItems);
  }

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    this.keyManager.onKeydown(event);
  }

  /**
   * Array of {@link SelectableGroup} items, that contain the actual {@link SelectableGroup}.
   */
  @Input() set groups(groups: SelectableGroup[]) {
    this._groups = groups;
  }
  get groups() {
    return this._groups;
  }
  /**
   *  Whether or not to support selection of multiple items
   */
  @Input() set multiple(m: boolean) {
    this._multiple = m;
  }
  get multiple() {
    return this._multiple;
  }
  @Input() columnWidth: number = 200;

  /**
   * Emitted when the component 'approves' the current selection.
   */
  @Output() select = new EventEmitter<Selectable[]>();

  get selectableItemIndex(): number {
    return this._selectableItemIndex++;
  }

  @HostBinding('class.multiple') _multiple: boolean = false;
  autofocus: boolean;
  enableSelectAll: boolean;
  columns: string = '';

  private selectedItems: Selectable[] = [];
  private focusedItem: Selectable;
  private resizeDebounce = 0;

  private sizeSource = new Subject<{ width: number; height: number }>();
  private resized$: Observable<{ width: number; height: number }> = this.sizeSource.asObservable();

  constructor(@Attribute('autofocus') autofocus: string, @Attribute('enableSelectAll') enableSelectAll: string, private elRef: ElementRef) {
    this.autofocus = autofocus === 'true' ? true : false;
    this.enableSelectAll = enableSelectAll === 'true' ? true : false;

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
        let c = 'oneColumn';
        if (v.width > 2 * this.columnWidth && v.width < 3 * this.columnWidth) {
          c = 'twoColumns';
        }
        if (v.width > 3 * this.columnWidth) {
          c = 'threeColumns';
        }
        this.columns = c;
      });
  }

  groupFocused(group: SelectableGroup) {
    const innerIdx = group.items.map((g: SelectableInternal) => g.index);
    if (!innerIdx.includes(this.keyManager.activeItemIndex)) {
      this.keyManager.setActiveItem(innerIdx[0]);
    }
  }

  itemSelected(item: SelectableInternal) {
    this.selectedItems = [item];
    this.propagateChange(this.selectedItems);
    this.select.emit(this.selectedItems);
  }

  itemToggled(selected: boolean, item: SelectableInternal) {
    if (this.multiple) {
      if (selected) {
        this.selectedItems.push(item);
      } else {
        this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
      }
      this.propagateChange(this.selectedItems);
    } else {
      this.selectedItems = [item];
    }
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

  toggleAllOfGroup(group: SelectableGroup) {
    if (this.enableSelectAll) {
      const selectedItemsIDs = this.selectedItems.map(i => i.id);
      const groupItemIDs = group.items.map(i => i.id);
      const contained = group.items.filter(i => selectedItemsIDs.includes(i.id));
      if (contained.length === group.items.length) {
        // all of the groups items are selected, so we'll remove them from teh current selection
        this.selectedItems = this.selectedItems.filter(i => !groupItemIDs.includes(i.id));
      } else {
        // add the group items that are not already part of the selection
        group.items.filter(i => !selectedItemsIDs.includes(i.id)).forEach(i => this.selectedItems.push(i));
      }
      this.propagateChange(this.selectedItems);
    }
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
