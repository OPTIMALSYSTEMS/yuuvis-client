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
import { NgxResize, NgxResizeResult } from 'ngx-resize';
import { Observable, Subject, timer } from 'rxjs';
import { debounce, tap } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { checkAll } from '../../svg.generated';
import { Selectable, SelectableGroup, SelectableInternal } from './grouped-select.interface';
import { SelectableItemComponent } from './selectable-item/selectable-item.component';

/**
 * Component for selecting a single or multiple entries from a set of grouped items. This component is implementing `ControlValueAccessor` so you can
 * also use it within Angular forms.
 *
 * > Setting the components **multiple** input to **true** will enable the selection of more than one item.
 * > In this case using the SPACE key on a focused entry or clicking the items checkbox will add or remove the
 * > item from the current selection and propagate this change.
 * > Clicking the label of an item will immediately reset the selection to the
 * > current item only. Hitting ENTER will also immediately select one item as long as there are no other items selected.
 *
 * ### Other properties
 * **enableSelectAll** - When set to true, clicking of the groups title will select all group items (multiple only)
 * **autofocus** - When set to true, the first item of the first group will be focused immediately
 * **singleGroup** - When set to true, styles are applied to render the component for one group only *
 *
 * @example
 * <yuv-grouped-select [groups]="groups" [multiple]="true"></yuv-grouped-select>
 */
@Component({
  selector: 'yuv-grouped-select',
  templateUrl: './grouped-select.component.html',
  styleUrls: ['./grouped-select.component.scss'],
  hostDirectives: [{ directive: NgxResize, outputs: ['ngxResize'] }],
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
    // Hitting ENTER will in any case trigger the select event, that
    // 'approves' the current selection.
    this.emit();
  }

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    this.keyManager.onKeydown(event);
  }

  /**
   * Array of {@link SelectableGroup} items, that contain the actual {@link SelectableGroup}.
   */
  @Input() groups: SelectableGroup[];

  /**
   *  Whether or not to support selection of multiple items
   */
  @HostBinding('class.multiple')
  @Input()
  multiple = false;

  /**
   *  Whether or not to clear selection after single select
   */
  @Input() singleSelect = true;

  @Input() hideEmptyGroup = false;

  /**
   *  Defines list of items that should be selected by default
   */
  @Input() set selection(ids: string[]) {
    this.selectedItems = ids.map((id) => this.findSelectable(id)).filter((v) => v);
  }

  @Input() columnWidth: number = 250;

  /**
   * Emitted when the component 'approves' the current selection.
   */
  @Output() select = new EventEmitter<Selectable | Selectable[]>();

  /**
   * Emitted on selection change.
   */
  @Output() change = new EventEmitter<Selectable | Selectable[]>();

  /**
   * Emitted on toggle change.
   */
  @Output() groupToggle = new EventEmitter<SelectableGroup>();

  get selectableItemIndex(): number {
    return this._selectableItemIndex++;
  }

  @HostBinding('class.singleGroup') @Input() singleGroup: boolean = false;
  @Input() autofocus: boolean;
  @Input() enableSelectAll: boolean;
  @Input() toggleable: boolean;
  @Input() columns: string = '';

  private _selectedItems: Selectable[] = [];

  set selectedItems(items: Selectable[]) {
    this._selectedItems = items || [];
    this.selectedItemsCheck = {};
    if (items) {
      items.forEach((s) => (this.selectedItemsCheck[s.id] = true));
    }
  }
  get selectedItems() {
    return this._selectedItems;
  }

  selectedItemsCheck = {};
  private focusedItem: Selectable;
  private resizeDebounce = 0;

  private sizeSource = new Subject<{ width: number; height: number }>();
  private resized$: Observable<{ width: number; height: number }> = this.sizeSource.asObservable();

  constructor(
    @Attribute('autofocus') autofocus: string,
    @Attribute('singleGroup') singleGroup: string,
    @Attribute('enableSelectAll') enableSelectAll: string,
    @Attribute('toggleable') toggleable: string,
    private elRef: ElementRef,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([checkAll]);
    this.autofocus = autofocus === 'true' ? true : false;
    this.enableSelectAll = enableSelectAll === 'true' ? true : false;
    this.singleGroup = singleGroup === 'true' ? true : false;
    this.toggleable = toggleable === 'true' ? true : false;
  }

  findSelectable(id: string) {
    return this.groups.reduce((pre, cur) => (pre = pre.concat(cur.items)), []).find((s) => s.id === id);
  }

  groupToggled(group: SelectableGroup, state: any) {
    if (state.originalEvent.fromState !== 'void') {
      this.groupToggle.emit(group);
    }
  }

  groupFocused(group: SelectableGroup) {
    const innerIdx = group.items.map((g: SelectableInternal) => g.index);
    if (!innerIdx.includes(this.keyManager.activeItemIndex)) {
      this.keyManager.setActiveItem(innerIdx[0]);
    }
  }

  itemSelected(item: SelectableInternal) {
    const selected = !this.isSelected(item);
    this.selectedItems = this.singleSelect ? [item] : this.selectedItems.filter((i) => i.id !== item.id).concat(selected ? [item] : []);
    this.emit();
  }

  itemToggled(selected: boolean, item: SelectableInternal) {
    if (this.multiple) {
      this.selectedItems = this.selectedItems.filter((i) => i.id !== item.id).concat(selected ? [item] : []);
    } else {
      this.selectedItems = selected ? [item] : [];
    }
    this.emit(false);
  }

  itemClicked(item: SelectableInternal) {
    this.keyManager.updateActiveItem(item.index);
  }

  isSelected(item): boolean {
    return this.selectedItems ? !!this.selectedItems.find((i) => i.id === item.id) : false;
  }

  itemFocused(item: SelectableInternal) {
    this.focusedItem = item;
  }

  toggleAllOfGroup(group: SelectableGroup) {
    if (this.enableSelectAll && this.multiple) {
      const selectedItemsIDs = this.selectedItems.map((i) => i.id);
      const groupItemIDs = group.items.map((i) => i.id);
      const contained = group.items.filter((i) => selectedItemsIDs.includes(i.id));
      if (contained.length === group.items.length) {
        // all of the groups items are selected, so we'll remove them from teh current selection
        this.selectedItems = this.selectedItems.filter((i) => !groupItemIDs.includes(i.id));
      } else {
        // add the group items that are not already part of the selection
        const sel = [...this.selectedItems];
        group.items.filter((i) => !selectedItemsIDs.includes(i.id)).forEach((i) => sel.push(i));
        this.selectedItems = sel;
      }
      this.emit(false);
    }
  }

  toggleCollapsed(group: SelectableGroup) {
    if (this.toggleable) {
      group.collapsed = !group.collapsed;
    }
  }
  
  @HostListener('ngxResize', ['$event'])
  onContainerResized(resize: NgxResizeResult) {
    this.sizeSource.next(resize);
  }

  propagateChange = (_: any) => {};

  writeValue(value: Selectable[]): void {
    this.selectedItems = value === undefined ? [] : value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  private emit(select = true) {
    this.propagateChange(this.selectedItems);
    const val = this.multiple ? this.selectedItems : this.selectedItems[0];
    this.change.emit(val);
    return select && this.select.emit(val);
  }

  focus() {
    if (this.groups.length) {
      this.keyManager.setActiveItem(0);
      this.elRef.nativeElement.querySelector('yuv-selectable-item').focus();
    }
  }

  ngAfterViewInit() {
    this.keyManager = new FocusKeyManager(this.items).skipPredicate((item) => item.disabled).withWrap();
    let i = 0;
    this.items.forEach((c: SelectableItemComponent) => (c._item.index = i++));
    if (this.autofocus) {
      this.focus();
    }

    this.resized$
      .pipe(
        debounce(() => {
          return timer(this.resizeDebounce);
        }),
        tap(() => {
          this.resizeDebounce = 500;
        })
      )
      .subscribe((v) => {
        this.columns = 'oneColumn';
        if (this.singleGroup) return;
        if (v.width > 3 * this.columnWidth) {
          this.columns = 'threeColumns';
        } else if (v.width > 2 * this.columnWidth) {
          this.columns = 'twoColumns';
        }
      });
  }
}
