import { Component, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { BaseObjectTypeField, ColumnConfig, DmsObject, SearchFilter, SearchQuery, SystemService, TranslateService } from '@yuuvis/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { CellRenderer } from '../../services/grid/grid.cellrenderer';
import { edit } from '../../svg.generated';
import { PopoverConfig } from './../../popover/popover.interface';
import { PopoverRef } from './../../popover/popover.ref';
import { PopoverService } from './../../popover/popover.service';
import { SearchResultComponent } from './../../search/search-result/search-result.component';
import { refresh, settings } from './../../svg.generated';

/**
 * Component rendering a context and its contents.
 * A context is a 'folder' that may contain other dms objects that aren't folders.
 *
 * [Screenshot](../assets/images/yuv-context.gif)
 *
 * @example
 * <yuv-context [context]="ctx"></yuv-context>
 */
@Component({
  selector: 'yuv-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss']
})
export class ContextComponent implements OnInit {
  busy: boolean;
  activeTabIndex: number;
  contextChildrenQuery: SearchQuery;
  recentItemsQuery: SearchQuery;
  columnConfigInput: any;

  activeSearchResult: SearchResultComponent;
  @ViewChildren(SearchResultComponent) searchResultComponents: QueryList<SearchResultComponent>;
  @ViewChild('tplColumnConfigPicker') tplColumnConfigPicker: TemplateRef<any>;

  layoutOptions = {
    'yuv-search-result-all': null,
    'yuv-search-result-recent': null
  };

  private _context: DmsObject;
  private _contextSearchQuery: SearchQuery;
  contextIcon: string;

  _layoutOptionsKeys = {
    children: null,
    recent: null,
    search: null
  };

  /**
   * The context item
   */
  @Input() set context(c: DmsObject) {
    this._context = c;
    this.contextIcon = c && CellRenderer.typeCellRenderer({ value: c.objectTypeId, context: { system: this.systemService } });
    this.setupContext();
  }
  get context() {
    return this._context;
  }

  /**
   * IDs of items supposed to be selected upfront.
   */
  @Input() preSelectItems: string[];

  /**
   * A search query to be executed within the current context.
   * The query will be extended by a filter that restricts the result
   * to be within the current context, if not already provided.
   */
  @Input() set contextSearchQuery(q: SearchQuery) {
    this._contextSearchQuery = !!q ? q : null;
    this.activeTabIndex = !!this.contextSearchQuery ? 2 : 0;
    if (this._contextSearchQuery && !this._contextSearchQuery.getFilter(BaseObjectTypeField.PARENT_ID)) {
      this._contextSearchQuery.addFilter(new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, this._context.id));
    }
  }
  get contextSearchQuery(): SearchQuery {
    return this._contextSearchQuery;
  }

  /**
   * Array of IDs used for fetching the recent items for this context.
   */
  @Input() set recentItems(ri: string[]) {
    this.setupRecentItemsQuery(ri);
  }

  /**
   * Providing a lyout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() set layoutOptionsKey(lok: string) {
    if (lok) {
      this._layoutOptionsKeys.children = `${lok}.children`;
      this._layoutOptionsKeys.recent = `${lok}.recent`;
      this._layoutOptionsKeys.search = `${lok}.search`;
    }
  }

  /** Emitted once an item from either one of the lists has been selected. */
  @Output() itemsSelected = new EventEmitter<string[]>();

  constructor(
    private translate: TranslateService,
    private iconRegistry: IconRegistryService,
    private popoverService: PopoverService,
    private systemService: SystemService
  ) {
    this.iconRegistry.registerIcons([edit, settings, refresh]);
  }

  select(ids: string[]) {
    this.itemsSelected.emit(ids);
  }

  private setupContext() {
    // create context child query
    const ccq = new SearchQuery();
    ccq.addFilter(new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, this.context.id));
    // by default result will be sorted by modification date, in order to always retrieve items that
    // were modified/created recently first
    ccq.sortOptions = [
      {
        field: BaseObjectTypeField.MODIFICATION_DATE,
        order: 'asc'
      }
    ];
    this.contextChildrenQuery = ccq;

    this.onTabChange({ index: 0 }); // activate searchResult
  }

  private setupRecentItemsQuery(recentItems: string[]) {
    if (recentItems && recentItems.length) {
      const q = new SearchQuery();
      q.addFilter(new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.IN, recentItems.reverse()));
      this.recentItemsQuery = q;
    } else {
      this.recentItemsQuery = null;
    }
  }

  onTabChange(tab: any) {
    setTimeout(() => {
      this.activeSearchResult = this.searchResultComponents.toArray()[tab.index];
      if (this.activeSearchResult) {
        this.columnConfigInput = {
          type: (this.activeSearchResult.query && this.activeSearchResult.query.targetType) || this.systemService.getBaseType(),
          sortOptions: this.activeSearchResult.query && this.activeSearchResult.query.sortOptions
        };
      }
    }, 0);
  }

  refresh(applyColumnConfig?: boolean) {
    return this.activeSearchResult && this.activeSearchResult.refresh(applyColumnConfig);
  }

  showColumnConfigEditor() {
    const popoverConfig: PopoverConfig = {
      width: '55%',
      height: '70%',
      data: this.columnConfigInput
    };
    this.popoverService.open(this.tplColumnConfigPicker, popoverConfig);
  }

  columnConfigChanged(columnConfig: ColumnConfig, popoverRef?: PopoverRef) {
    this.refresh(true);

    if (popoverRef) {
      popoverRef.close();
    }
  }

  ngOnInit() {}
}
