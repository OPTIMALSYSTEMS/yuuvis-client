import { RowEvent } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ColumnConfig, DmsService, SearchQuery, SearchService, SystemService, TranslateService } from '@yuuvis/core';
import { finalize, Observable, switchMap } from 'rxjs';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { ResponsiveDataTableOptions, ViewMode } from '../../components/responsive-data-table/responsive-data-table.component';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { download, kebap, refresh, search, settings } from '../../svg.generated';
import { FilterPanelConfig, SearchResultComponent } from '../search-result/search-result.component';
import { UserConfigService } from './../../../../../core/src/lib/service/user-config/user-config.service';
/**
 * This component wraps a `SearchResultComponent`.
 *
 * [Screenshot](../assets/images/yuv-search-result-panel.gif)
 *
 * @example
 *  <yuv-search-result-panel [query]="query" [selectItems]="selectedItems"
 * (queryChanged)="onQueryChange($event)" [showFilterPanel]="showFilterPanel" [layoutOptionsKey]="layoutOptionsKey" (itemsSelected)="select($event)"
 * (filterPanelToggled)="onFilterPanelToggled($event)" (rowDoubleClicked)="onRowDoubleClicked($event)"></yuv-search-result-panel>
 */
@Component({
  selector: 'yuv-search-result-panel',
  templateUrl: './search-result-panel.component.html',
  styleUrls: ['./search-result-panel.component.scss']
})
export class SearchResultPanelComponent {
  // icons used within the template
  _searchQuery: SearchQuery;
  _options: ResponsiveDataTableOptions;
  columnConfigInput: any;
  viewMode: ViewMode = 'standard';
  queryDescription: string;
  actionMenuVisible = false;
  actionMenuSelection = [];
  downloadingCsv = false;

  loading: boolean;

  @ViewChild(SearchResultComponent) searchResultComponent: SearchResultComponent;
  @ViewChild('tplColumnConfigPicker') tplColumnConfigPicker: TemplateRef<any>;

  /**
   * Search query to be executed and rendered in the result list.
   */
  @Input() set query(searchQuery: SearchQuery) {
    this._searchQuery = searchQuery;
    this.onQueryChangedFromWithin(searchQuery, false);
  }
  /**
   * List of result list item IDs supposed to be selected upfront.
   */
  @Input() preSelectItems: string[];

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() layoutOptionsKey: string;
  @Input() filterPanelConfig: FilterPanelConfig;
  @Input() disableFilterPanel: boolean;

  @Input() plugins: Observable<any[]>;

  /**
   * Emitted when column sizes of the contained result list table have been changed.
   */
  @Output() optionsChanged = new EventEmitter<ResponsiveDataTableOptions>();
  /**
   * Emits a list of IDs of items that has been selected.
   */
  @Output() itemsSelected = new EventEmitter<string[]>();
  /**
   * Emitted once a result list item has been double-clicked.
   */
  @Output() rowDoubleClicked = new EventEmitter<RowEvent>();
  /**
   * Emitted when the query has been changed from within the component
   */
  @Output() queryChanged = new EventEmitter<SearchQuery>();
  /**
   * Emitted when the query has been changed and a new descriptor has been set
   */
  @Output() queryDescriptionChange = new EventEmitter<string>();
  /**
   * Emitted when the visibility or width of the filter panel changes
   */
  @Output() filterPanelConfigChanged = new EventEmitter<FilterPanelConfig>();

  constructor(
    private translate: TranslateService,
    private systemService: SystemService,
    private popoverService: PopoverService,
    private dmsService: DmsService,
    private iconRegistry: IconRegistryService,
    private searchService: SearchService,
    private userConfig: UserConfigService
  ) {
    this.iconRegistry.registerIcons([settings, search, refresh, kebap, download]);
  }

  refresh(applyColumnConfig?: boolean) {
    if (this.searchResultComponent) {
      this.searchResultComponent.refresh(applyColumnConfig);
    }
  }

  onItemsSelected(itemIDs) {
    this.itemsSelected.emit(itemIDs);
    this.preSelectItems = itemIDs;
  }

  generateQueryDescription(searchQuery: SearchQuery) {
    let description = '';
    if (searchQuery) {
      const translateParams = {
        term: searchQuery.term || '',
        types:
          (searchQuery.lots || []).map((t) => this.systemService.getLocalizedResource(`${t}_label`)).join(', ') ||
          this.translate.instant('yuv.framework.quick-search.type.all'),
        extensions: (searchQuery.types || []).map((t) => this.systemService.getLocalizedResource(`${t}_label`)).join(', ')
      };
      description = this.translate.instant('yuv.framework.search-result-panel.header.description.types', translateParams);
      if (translateParams.extensions) {
        description += ' ' + this.translate.instant('yuv.framework.search-result-panel.header.description.extended.by', translateParams);
      }
    }
    if (description !== this.queryDescription) {
      this.queryDescription = description;
      this.queryDescriptionChange.emit(this.queryDescription);
    }
  }

  onViewModeChanged(mode: ViewMode) {
    this.viewMode = mode;
  }

  onQueryChangedFromWithin(searchQuery: SearchQuery, emit = true) {
    this.updateColumnConfig(searchQuery);
    this.generateQueryDescription(searchQuery);
    return emit && this.queryChanged.emit(searchQuery);
  }

  onFilterPanelConfigChanged(cfg: FilterPanelConfig) {
    if (this.filterPanelConfigChanged) {
      this.filterPanelConfigChanged.emit(cfg);
    }
  }

  openActionMenu() {
    if (this.preSelectItems) {
      this.loading = true;
      this.dmsService.getDmsObjects(this.preSelectItems).subscribe((items) => {
        this.actionMenuSelection = items;
        this.actionMenuVisible = true;
        this.loading = false;
      });
    }
  }

  updateColumnConfig(searchQuery: SearchQuery) {
    const type = (searchQuery && searchQuery.targetType) || this.systemService.getBaseType();
    this.columnConfigInput = { type, sortOptions: searchQuery && searchQuery.sortOptions };
  }

  showColumnConfigEditor() {
    const popoverConfig: PopoverConfig = {
      height: '70%',
      maxWidth: '600px',
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

  exportCSV() {
    this.downloadingCsv = true;
    this.userConfig
      .getColumnConfig(this.columnConfigInput.type.id)
      .pipe(
        switchMap((conf) =>
          this.searchService
            .exportSearchResult({ ...this.searchService.getLastSearchQuery().toQueryJson(), fields: conf.columns.map((col) => col.id) }, null)
            .pipe(finalize(() => (this.downloadingCsv = false)))
        )
      )
      .subscribe();
  }
}
