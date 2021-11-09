import { FocusKeyManager } from '@angular/cdk/a11y';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BaseObjectTypeField, ClientDefaultsObjectTypeField, SearchQuery, SearchResult, SearchService, SystemService } from '@yuuvis/core';
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
  @Output() objectSelect = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();

  @HostListener('keydown', ['$event']) onKeyDown(event) {
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

  onQuickSearchQueryChange(q: SearchQuery) {
    if (q.filterGroup.filters.length || q.term?.length || q.types.length || q.lots.length) {
      q.fields = [
        BaseObjectTypeField.OBJECT_ID,
        BaseObjectTypeField.OBJECT_TYPE_ID,
        ClientDefaultsObjectTypeField.TITLE,
        ClientDefaultsObjectTypeField.DESCRIPTION
      ];
      q.size = 10;
      this.loading = true;
      this.searchService.search(q).subscribe(
        (res: SearchResult) => {
          this.total = res.totalNumItems;
          this.searchResult = res.items.map((i) => ({
            id: i.fields.get(BaseObjectTypeField.OBJECT_ID),
            svgSrc: this.system.getObjectTypeIconUri(i.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID)),
            label: i.fields.get(ClientDefaultsObjectTypeField.TITLE),
            description: i.fields.get(ClientDefaultsObjectTypeField.DESCRIPTION)
          }));
          this.keyManager = new FocusKeyManager(this.items);
          this.loading = false;
        },
        (err) => {
          console.error(err);
          this.loading = false;
        }
      );
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
