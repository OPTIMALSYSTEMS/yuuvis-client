import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { BaseObjectTypeField, DmsObject, DmsService, SearchFilter, SearchQuery, TranslateService } from '@yuuvis/core';
import { edit } from '../../svg.generated';

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
  // selectedItem: string;

  layoutOptions = {
    'yuv-search-result-all': null,
    'yuv-search-result-recent': null
  };

  private _context: DmsObject;
  /**
   * The context item
   */
  @Input() set context(c: DmsObject) {
    this._context = c;
    this.setupContext();
  }
  get context() {
    return this._context;
  }

  /**
   * IDs of items supposed to be selected upfront.
   */
  @Input() preSelectItems: string[];

  private _contextSearchQuery: SearchQuery;
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

  @Input() set recentItems(ri: string[]) {
    this.setupRecentItemsQuery(ri);
  }

  @Output() itemsSelected = new EventEmitter<string[]>();

  _layoutOptionsKeys = {
    children: null,
    recent: null,
    search: null
  };
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

  constructor(private translate: TranslateService, private iconRegistry: IconRegistryService, private dmsService: DmsService) {
    this.iconRegistry.registerIcons([edit]);
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

  ngOnInit() {}
}
