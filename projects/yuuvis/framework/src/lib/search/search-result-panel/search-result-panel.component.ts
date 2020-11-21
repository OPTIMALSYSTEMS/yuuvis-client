import { RowEvent } from '@ag-grid-community/core';
import { Attribute, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ColumnConfig, DmsService, SearchQuery, SystemService, TranslateService } from '@yuuvis/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { ResponsiveDataTableOptions, ViewMode } from '../../components/responsive-data-table/responsive-data-table.component';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { kebap, refresh, search } from '../../svg.generated';
import { FilterPanelConfig, SearchResultComponent } from '../search-result/search-result.component';
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
    @Attribute('applyColumnConfig') public applyColumnConfig: boolean,
    private translate: TranslateService,
    private systemService: SystemService,
    private popoverService: PopoverService,
    private dmsService: DmsService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([search, refresh, kebap]);
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
        types: (searchQuery.lots || []).map((t) => this.systemService.getLocalizedResource(`${t}_label`)).join(', '),
        extensions: (searchQuery.types || []).map((t) => this.systemService.getLocalizedResource(`${t}_label`)).join(', ')
      };
      if (translateParams.types || translateParams.extensions) {
        description =
          this.translate.instant('yuv.framework.search-result-panel.header.description.types', translateParams) +
          (translateParams.extensions ? ` >>> ${translateParams.extensions}` : '');
      } else if (translateParams.term) {
        description = this.translate.instant('yuv.framework.search-result-panel.header.description', translateParams);
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

  // onSearchResultOptionsChanged(options: ResponsiveDataTableOptions) {
  //   if (options) {
  //     this.viewMode = options.viewMode;
  //   }
  //   this.optionsChanged.emit(options);
  // }

  openActionMenu() {
    if (this.preSelectItems) {
      this.dmsService.getDmsObjects(this.preSelectItems).subscribe((items) => {
        this.actionMenuSelection = items;
        this.actionMenuVisible = true;
      });
    }
  }

  updateColumnConfig(searchQuery: SearchQuery) {
    const type = (searchQuery && searchQuery.targetType) || this.systemService.getBaseType();
    this.columnConfigInput = { type, sortOptions: searchQuery && searchQuery.sortOptions };
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
}
