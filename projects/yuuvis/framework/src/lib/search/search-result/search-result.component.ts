import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  BaseObjectTypeField,
  DmsObject,
  EventService,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchService,
  SecondaryObjectTypeField,
  SortOption,
  YuvEvent,
  YuvEventType
} from '@yuuvis/core';
import { ColDef } from 'ag-grid-community';
import { of } from 'rxjs';
import { takeUntilDestroy } from 'take-until-destroy';
import { ResponsiveDataTableComponent } from '../../components/responsive-data-table/responsive-data-table.component';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { GridService } from '../../services/grid/grid.service';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  host: { class: 'yuv-search-result toolbar' }
})
export class SearchResultComponent implements OnDestroy {
  private _searchQuery: SearchQuery;
  private _columns: ColDef[];
  private _rows: any[];
  private _hasPages = false;
  pagingForm: FormGroup;
  busy: boolean;

  // icons used within the template
  icon = {
    icSearchFilter: SVGIcons['search-filter'],
    icArrowNext: SVGIcons['arrow-next'],
    icArrowLast: SVGIcons['arrow-last'],
    icKebap: SVGIcons['kebap']
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

  @Input() options: any;
  @Output() optionsChanged = new EventEmitter();

  @ViewChild('dataTable', { static: false }) dataTable: ResponsiveDataTableComponent;

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

  get query() {
    return this._searchQuery;
  }

  /**
   * The IDs of the items to be selected
   */
  @Input() selectedItemIDs: string[];
  /**
   * Emits the current selection as list of object IDs
   */
  @Output() itemsSelected = new EventEmitter<string[]>();

  set hasPages(count) {
    this._hasPages = count;
  }

  get hasPages(): boolean {
    return this._hasPages;
  }

  constructor(private gridService: GridService, private eventService: EventService, private searchService: SearchService, private fb: FormBuilder) {
    this.pagingForm = this.fb.group({
      page: ['']
    });

    this.eventService
      .on(YuvEventType.DMS_OBJECT_UPDATED)
      .pipe(takeUntilDestroy(this))
      .subscribe((e: YuvEvent) => {
        const dmsObject = e.data as DmsObject;
        if (this.dataTable) {
          // Update table data without reloading the whole grid
          this.dataTable.updateRow(dmsObject.id, dmsObject.data);
        }
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
    let objecttypeId;
    if (this._searchQuery) {
      objecttypeId = this._searchQuery.types.length > 1 ? null : this._searchQuery.types[0] || null;
    }

    (objecttypeId !== this.resultListObjectTypeId || !this._columns ? this.gridService.getColumnConfiguration(objecttypeId) : of(this._columns)).subscribe(
      (colDefs: ColDef[]) => {
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

        // setup column width
        if (this.options) {
          colDefs.forEach(col => (col.width = this.options[col.field] || col.width));
        }

        this.resultListObjectTypeId = objecttypeId;
        this._columns = colDefs;
        this._rows = searchResult.items.map(i => this.getRow(i));
        const sortOptions = this._searchQuery ? this._searchQuery.sortOptions || [] : [];

        this.tableData = {
          columns: this._columns,
          rows: this._rows,
          titleField: SecondaryObjectTypeField.TITLE,
          descriptionField: SecondaryObjectTypeField.DESCRIPTION,
          selectType: 'multiple',
          sortModel: sortOptions.map(o => ({
            colId: o.field,
            sort: o.order
          }))
        };

        this.busy = false;
      }
    );
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
    this.selectedItemIDs = selectedRows.map(r => r.id);
    this.itemsSelected.emit(this.selectedItemIDs);
  }

  onSortChanged(sortModel: { colId: string; sort: string }[]) {
    if (JSON.stringify(this.tableData.sortModel) !== JSON.stringify(sortModel)) {
      // change query to reflect the sort setting from the grid
      this._searchQuery.sortOptions = sortModel.map(m => new SortOption(m.colId, m.sort));
      this._searchQuery.from = 0;
      this.executeQuery();
      this.gridService.persistSortSettings(this._searchQuery.sortOptions, this.resultListObjectTypeId);
    }
  }

  ngOnDestroy() {}
}
