import { RowEvent } from '@ag-grid-community/core';
import { Attribute, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { ColumnConfig, DmsService, SearchQuery, SystemService, TranslateService } from '@yuuvis/core';
import { ResponsiveDataTableOptions, ViewMode } from '../../components/responsive-data-table/responsive-data-table.component';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { kebap, refresh, search } from '../../svg.generated';
import { SearchResultComponent } from '../search-result/search-result.component';

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

  @ViewChild(SearchResultComponent, { static: false }) searchResultComponent: SearchResultComponent;
  @ViewChild('tplColumnConfigPicker', { static: false }) tplColumnConfigPicker: TemplateRef<any>;

  /**
   * Search query to be executed and rendered in the result list.
   */
  @Input() set query(searchQuery: SearchQuery) {
    this._searchQuery = searchQuery;
    this.columnConfigInput = searchQuery && searchQuery.types && searchQuery.types.length === 1 ? searchQuery.types[0] : this.systemService.getBaseType();
    if (searchQuery && searchQuery.types && searchQuery.types.length === 1) {
      this.columnConfigInput = searchQuery.types[0];
    }
    if (searchQuery) {
      this.generateQueryDescription();
    }
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

  refresh() {
    if (this.searchResultComponent) {
      this.searchResultComponent.refresh();
    }
  }

  onItemsSelected(itemIDs) {
    this.itemsSelected.emit(itemIDs);
    this.preSelectItems = itemIDs;
  }

  generateQueryDescription() {
    const translateParams = {
      term: this._searchQuery.term || '',
      types: this._searchQuery.types.length ? this._searchQuery.types.map(t => this.systemService.getLocalizedResource(`${t}_label`)).join(', ') : null
    };
    if (translateParams.term && !translateParams.types) {
      this.queryDescription = this.translate.instant('yuv.framework.search-result-panel.header.description', translateParams);
    } else if (translateParams.types) {
      this.queryDescription = this.translate.instant('yuv.framework.search-result-panel.header.description.types', translateParams);
    } else {
      this.queryDescription = '';
    }
    this.queryDescriptionChange.emit(this.queryDescription);
  }

  onViewModeChanged(mode: ViewMode) {
    this.viewMode = mode;
  }

  onQueryChangedFromWithin(searchQuery: SearchQuery) {
    this.query = searchQuery;
    this.queryChanged.emit(searchQuery);
  }

  // onSearchResultOptionsChanged(options: ResponsiveDataTableOptions) {
  //   if (options) {
  //     this.viewMode = options.viewMode;
  //   }
  //   this.optionsChanged.emit(options);
  // }

  openActionMenu() {
    if (this.preSelectItems) {
      this.dmsService.getDmsObjects(this.preSelectItems).subscribe(items => {
        this.actionMenuSelection = items;
        this.actionMenuVisible = true;
      });
    }
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
    this.refresh();

    if (popoverRef) {
      popoverRef.close();
    }
  }
}
