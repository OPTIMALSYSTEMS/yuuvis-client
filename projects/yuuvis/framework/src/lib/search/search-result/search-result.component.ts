import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseObjectTypeField, SearchQuery, SearchResult, SearchResultItem, SearchService, SecondaryObjectTypeField, SortOption } from '@yuuvis/core';
import { ColDef } from 'ag-grid-community';
import { of } from 'rxjs';
import { ResponsiveTableData } from '../../components';
import { ColumnSizes } from '../../services/grid/grid.interface';
import { GridService } from '../../services/grid/grid.service';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  host: { class: 'yuv-search-result toolbar' }
})
export class SearchResultComponent {
  private _searchQuery: SearchQuery;
  private _columns: ColDef[];
  private _rows: any[];
  private _hasPages = false;
  pagingForm: FormGroup;

  // icons used within the template
  icon = {
    icSearchFilter: SVGIcons['search-filter'],
    icArrowNext: SVGIcons['arrow-next'],
    icArrowLast: SVGIcons['arrow-last']
  };
  tableData: ResponsiveTableData;
  // object type shown in the result list, will be null for mixed results
  private resultListObjectTypeId: string;
  totalNumItems: number;
  // state of pagination
  pagination: {
    pages: number;
    page: number;
  };

  @Input() set query(searchQuery: SearchQuery) {
    this._searchQuery = searchQuery;
    if (searchQuery) {
      this.executeQuery();
    } else {
      // reset
      this.createTableData({
        hasMoreItems: false,
        totalNumItems: 0,
        items: [],
        objectTypes: []
      });
    }
  }
  /**
   * The ID of the item to be selected
   */
  @Input() selectedItemId: string;
  /**
   * Emits the current selection as list of object IDs
   */
  @Output() itemsSelected = new EventEmitter<string[]>();

  // indicator that the component is busy loading data, so we are able to prevent user interaction
  @HostBinding('class.busy') busy = false;

  set hasPages(count) {
    this._hasPages = count;
  }

  get hasPages(): boolean {
    return this._hasPages;
  }

  constructor(private gridService: GridService, private searchService: SearchService, private fb: FormBuilder) {
    this.pagingForm = this.fb.group({
      page: ['']
    });
  }

  /**
   * re-run the current query
   */
  refresh() {
    this.executeQuery();
  }

  private executeQuery() {
    this.busy = true;
    this.searchService.search(this._searchQuery).subscribe((res: SearchResult) => {
      this.totalNumItems = res.totalNumItems;
      this.createTableData(res);
    });
  }

  // Create actual table data from the search result
  private createTableData(searchResult: SearchResult, pageNumber = 1): void {
    // object type of the result list items, if NULL we got a mixed result
    // const id = searchResult.objectTypes.length > 1 ? null : searchResult.objectTypes[0];
    const id = this._searchQuery.types.length > 1 ? null : this._searchQuery.types[0] || null;

    (id !== this.resultListObjectTypeId || !this._columns ? this.gridService.getColumnConfiguration(id) : of(this._columns)).subscribe((colDefs: ColDef[]) => {
      // setup pagination form in case of a paged search result chunk
      this.pagination = null;
      this.hasPages = searchResult.items.length !== searchResult.totalNumItems;
      if (this._searchQuery && searchResult.totalNumItems > this._searchQuery.size) {
        this.pagination = {
          pages: Math.ceil(searchResult.totalNumItems / this._searchQuery.size),
          page: (!this._searchQuery.from ? 0 : this._searchQuery.from / this._searchQuery.size) + 1
        };

        this.pagingForm.get('page').setValue(pageNumber);
        this.pagingForm.get('page').setValidators([Validators.min(0), Validators.max(this.pagination.pages)]);
      }

      this.resultListObjectTypeId = id;
      this._columns = colDefs;
      this._rows = searchResult.items.map(i => this.getRow(i));

      this.tableData = {
        columns: this._columns,
        rows: this._rows,
        titleField: SecondaryObjectTypeField.TITLE,
        descriptionField: SecondaryObjectTypeField.DESCRIPTION,
        selectType: 'single',
        sortModel: (this._searchQuery.sortOptions || []).map(o => ({
          colId: o.field,
          sort: o.order
        }))
      };

      this.busy = false;
    });
  }

  /**
   * Map search result item to a row data item
   */
  private getRow(searchResultItem: SearchResultItem): any {
    const row = {
      id: searchResultItem.fields.get(BaseObjectTypeField.OBJECT_ID),
      [SecondaryObjectTypeField.TITLE]: searchResultItem.fields.get(SecondaryObjectTypeField.TITLE),
      [SecondaryObjectTypeField.DESCRIPTION]: searchResultItem.fields.get(SecondaryObjectTypeField.DESCRIPTION)
    };
    this._columns.forEach((cd: ColDef) => {
      row[cd.field] = searchResultItem.fields.get(cd.field);
    });
    return row;
  }

  onPagingFormSubmit() {
    if (this.pagingForm.valid) {
      this.goToPage(this.pagingForm.value.page);
    }
  }

  goToPage(page: number) {
    this.busy = true;
    this.searchService.getPage(this._searchQuery, page).subscribe(
      (res: SearchResult) => {
        this.createTableData(res, page);
      },
      err => {
        // TODO: how should errors be handles in case hat loading pages fail
      },
      () => {
        this.busy = false;
      }
    );
  }

  onSelectionChanged(selectedRows: any[]) {
    this.itemsSelected.emit(selectedRows.map(r => r.id));
  }

  onSortChanged(sortModel: { colId: string; sort: string }[]) {
    if (JSON.stringify(this.tableData.sortModel) !== JSON.stringify(sortModel)) {
      // change query to reflect the sort setting from the grid
      this._searchQuery.sortOptions = sortModel.map(m => new SortOption(m.colId, m.sort));
      this._searchQuery.from = 0;
      this.executeQuery();
    }
  }

  onColumnResized(colSizes: ColumnSizes) {
    this.gridService.persistColumnWidthSettings(colSizes, this.resultListObjectTypeId);
  }
}
