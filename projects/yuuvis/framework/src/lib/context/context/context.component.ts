import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import {
  BaseObjectTypeField,
  ColumnConfig,
  DmsObject,
  DmsService,
  EventService,
  SearchFilter,
  SearchQuery,
  SystemService,
  TranslateService,
  UserService,
  YuvEventType,
  YuvUser
} from '@yuuvis/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { FileDropOptions } from '../../directives/file-drop/file-drop.directive';
import { LayoutService } from '../../services/layout/layout.service';
import { edit, kebap } from '../../svg.generated';
import { PopoverConfig } from './../../popover/popover.interface';
import { PopoverRef } from './../../popover/popover.ref';
import { PopoverService } from './../../popover/popover.service';
import { FilterPanelConfig, SearchResultComponent } from './../../search/search-result/search-result.component';
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
export class ContextComponent implements OnInit, OnDestroy {
  busy: boolean;
  activeTabIndex: number;
  contextChildrenQuery: SearchQuery;
  recentItemsQuery: SearchQuery;
  columnConfigInput: any;

  activeSearchResult: SearchResultComponent;
  @ViewChildren(SearchResultComponent) searchResultComponents: QueryList<SearchResultComponent>;
  @ViewChild('tplColumnConfigPicker') tplColumnConfigPicker: TemplateRef<any>;

  private _context: DmsObject;
  private _contextSearchQuery: SearchQuery;
  actionMenuVisible = false;
  actionMenuSelection: DmsObject[] = [];
  filterPanelConfig: FilterPanelConfig;

  _layoutOptionsKeys = {
    children: null,
    recent: null,
    search: null,
    layout: null
  };

  /**
   * The context item
   */
  @Input() set context(c: DmsObject) {
    this._context = c;
    if (c) {
      const params = {
        value: this.systemService.getLeadingObjectTypeID(c.objectTypeId, c.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]),
        context: {
          system: this.systemService
        }
      };
    }
    this.setupContext();
  }
  get context() {
    return this._context;
  }

  private _psi: string[];
  /**
   * IDs of items supposed to be selected upfront.
   */
  @Input() set preSelectItems(items: string[]) {
    this._psi = items.filter((id) => id !== this._context.id);
  }
  get preSelectItems() {
    return this._psi;
  }

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
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() set layoutOptionsKey(lok: string) {
    if (lok) {
      this._layoutOptionsKeys.children = `${lok}.children`;
      this._layoutOptionsKeys.recent = `${lok}.recent`;
      this._layoutOptionsKeys.search = `${lok}.search`;
      this._layoutOptionsKeys.layout = `${lok}.layout`;

      // load own settings
      this.layoutService.loadLayoutOptions(this._layoutOptionsKeys.layout, 'filterPanelConfig').subscribe((o: FilterPanelConfig) => {
        this.filterPanelConfig = o;
      });
    }
  }

  /** Emitted once an item from either one of the lists has been selected. */
  @Output() itemsSelected = new EventEmitter<string[]>();
  /** Emitted when files are dropped to the component */
  @Output() filesDropped = new EventEmitter<File[]>();

  fileDropOptions: FileDropOptions = {
    disabled: false,
    multiple: true
  };

  @Input() plugins: Observable<any[]>;

  constructor(
    private translate: TranslateService,
    private dmsService: DmsService,
    private iconRegistry: IconRegistryService,
    private popoverService: PopoverService,
    private userService: UserService,
    private layoutService: LayoutService,
    private eventService: EventService,
    private systemService: SystemService
  ) {
    this.iconRegistry.registerIcons([edit, settings, refresh, kebap]);
    this.userService.user$.subscribe((user: YuvUser) => {
      this.fileDropOptions.disabled = !this.userService.canCreateObjects;
    });

    this.fileDropOptions.label = this.translate.instant('yuv.framework.context.filedrop.label');
    this.eventService
      .on(YuvEventType.DMS_OBJECTS_MOVED, YuvEventType.DMS_OBJECT_UPDATED)
      .pipe(
        takeUntilDestroy(this),
        tap(({ type, data }) => (type === YuvEventType.DMS_OBJECT_UPDATED && data.id === this.context.id ? (this.context = data) : null))
      )
      .subscribe(() => this.refresh());
  }

  select(ids: string[]) {
    this.itemsSelected.emit(ids);
    this.preSelectItems = ids;
  }

  openActionMenu() {
    if (this.preSelectItems) {
      this.dmsService.getDmsObjects(this.preSelectItems).subscribe((items) => {
        this.actionMenuSelection = items;
        this.actionMenuVisible = true;
      });
    }
  }

  onFilterPanelConfigChanged(cfg: FilterPanelConfig) {
    this.filterPanelConfig = cfg;
    this.layoutService.saveLayoutOptions(this._layoutOptionsKeys.layout, 'filterPanelConfig', cfg).subscribe();
  }

  onFilesDropped(files: File[]) {
    this.filesDropped.emit(files);
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
    this.activeTabIndex = tab.index;
    setTimeout(() => {
      this.activeSearchResult = this.searchResultComponents.toArray()[tab.index];
      if (this.activeSearchResult) {
        this.columnConfigInput = {
          type: (this.activeSearchResult.query && this.activeSearchResult.query.targetType) || this.systemService.getBaseType(true),
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

  columnConfigCanceled(popoverRef: PopoverRef) {
    popoverRef.close();
  }

  ngOnInit() {}

  ngOnDestroy() {}
}
