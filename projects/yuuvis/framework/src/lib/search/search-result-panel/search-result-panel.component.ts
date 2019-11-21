import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DmsService, SearchQuery, SystemService, TranslateService } from '@yuuvis/core';
import { RowEvent } from 'ag-grid-community';
import { SVGIcons } from '../../svg.generated';
import { SearchResultComponent } from '../search-result/search-result.component';

@Component({
  selector: 'yuv-search-result-panel',
  templateUrl: './search-result-panel.component.html',
  styleUrls: ['./search-result-panel.component.scss']
})
export class SearchResultPanelComponent {
  // icons used within the template
  icon = {
    icSearch: SVGIcons['search'],
    refresh: SVGIcons['refresh'],
    icKebap: SVGIcons['kebap']
  };

  _searchQuery: SearchQuery;
  queryDescription: string;
  actionMenuVisible = false;
  actionMenuSelection = [];

  @ViewChild(SearchResultComponent, { static: false }) searchResultComponent: SearchResultComponent;

  /**
   * Search query to be executed and rendered in the result list.
   */
  @Input() set query(searchQuery: SearchQuery) {
    this._searchQuery = searchQuery;
    if (searchQuery) {
      this.generateQueryDescription();
    }
  }
  /**
   * List of result list item IDs supposed to be selected.
   */
  @Input() selectedItemIDs: string[];
  /**
   * Options to be applied to the contained result list table.
   * Currently these options will control the tables column sizes.
   */
  @Input() options;
  /**
   * Emitted when column sizes of the contained result list table have been changed.
   */
  @Output() optionsChanged = new EventEmitter();
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

  constructor(private translate: TranslateService, private systemService: SystemService, private dmsService: DmsService) {}

  refresh() {
    if (this.searchResultComponent) {
      this.searchResultComponent.refresh();
    }
  }

  onItemsSelected(itemIDs) {
    this.itemsSelected.emit(itemIDs);
    this.selectedItemIDs = itemIDs;
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

  onQueryChangedFromWithin(searchQuery: SearchQuery) {
    this.query = searchQuery;
    this.queryChanged.emit(searchQuery);
  }

  openActionMenu() {
    if (this.selectedItemIDs) {
      this.dmsService.getDmsObjects(this.selectedItemIDs).subscribe(items => {
        this.actionMenuSelection = items;
        this.actionMenuVisible = true;
      });
    }
  }
}
