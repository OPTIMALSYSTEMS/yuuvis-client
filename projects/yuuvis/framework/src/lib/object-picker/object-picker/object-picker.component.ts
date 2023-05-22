import { FocusKeyManager } from '@angular/cdk/a11y';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BaseObjectTypeField, SearchFilter, SearchQuery, SearchResult, SearchService, SystemService } from '@yuuvis/core';
import { finalize, map } from 'rxjs/operators';
import { Selectable } from '../../grouped-select/grouped-select/grouped-select.interface';
import { SelectableItemComponent } from '../../grouped-select/grouped-select/selectable-item/selectable-item.component';
import { PopoverRef } from '../../popover/popover.ref';
import { QuickSearchComponent } from '../../search/quick-search/quick-search.component';

@Component({
  selector: 'yuv-object-picker',
  templateUrl: './object-picker.component.html',
  styleUrls: ['./object-picker.component.scss']
})
export class ObjectPickerComponent implements OnInit {
  private keyManager: FocusKeyManager<SelectableItemComponent>;
  @ViewChildren(SelectableItemComponent) items: QueryList<SelectableItemComponent>;
  @ViewChild(QuickSearchComponent) quickSearchComponent: QuickSearchComponent;

  @Input() headline: string;
  @Input() popoverRef: PopoverRef;
  // list of types (object type IDs) that should not be shown in the object type picker
  @Input() skipTypes: string[];
  @Output() objectSelect = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();

  @HostListener('keydown', ['$event'])
  onKeyDown(event) {
    // ENTER or SPACE
    if ((event.keyCode === 13 || event.keyCode === 32) && this.focusedResultItem) {
      this.onResultItemSelect(this.focusedResultItem);
    }

    if (this.keyManager) {
      this.keyManager.onKeydown(event);
    }
  }

  loading: boolean;
  total: number;
  searchResult: Selectable[] = [];
  focusedResultItem: Selectable;

  constructor(private searchService: SearchService, private system: SystemService) {}

  onQuickSearchQueryChange(query: SearchQuery) {
    const baseProps = this.system.getBaseProperties();
    if (query.filterGroup.filters.length || query.term?.length || query.types.length || query.lots.length) {
      query.fields = [
        BaseObjectTypeField.OBJECT_ID,
        BaseObjectTypeField.OBJECT_TYPE_ID,
        BaseObjectTypeField.LEADING_OBJECT_TYPE_ID,
        baseProps.title,
        baseProps.description
      ];
      query.size = 10;

      if (this.skipTypes?.length) {
        query.addFilter(new SearchFilter(BaseObjectTypeField.LEADING_OBJECT_TYPE_ID, SearchFilter.OPERATOR.IN, this.skipTypes, null, true));
      }

      this.loading = true;
      this.searchService
        .search(query)
        .pipe(
          map((res: SearchResult) => {
            this.total = res.totalNumItems;
            this.searchResult = res.items.map((item) => ({
              id: item.fields.get(BaseObjectTypeField.OBJECT_ID),
              svgSrc: this.system.getObjectTypeIconUri(item.fields.get(BaseObjectTypeField.LEADING_OBJECT_TYPE_ID)),
              label: item.fields.get(baseProps.title),
              description: item.fields.get(baseProps.description)
            }));
          }),
          finalize(() => (this.loading = false))
        )
        .subscribe();
    } else {
      this.onQuickSearchReset();
    }
  }

  onQuickSearchReset() {
    this.searchResult = [];
  }

  onResultItemSelect(e) {
    this.objectSelect.emit(e);
    this.reset();
  }

  itemFocused(item) {
    this.focusedResultItem = item;
  }

  private reset() {
    this.quickSearchComponent.reset();
  }

  ngOnInit(): void {}
}
