<<<<<<< HEAD
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseObjectTypeField, SearchQuery, SearchResult, SearchResultItem, SearchService, SecondaryObjectTypeField, SortOption, SystemService, TranslateService } from '@yuuvis/core';
import { ColDef } from 'ag-grid-community';
import { ResponsiveTableData } from '../../components';
import { ColumnSizes } from '../../services/grid/grid.interface';
import { GridService } from '../../services/grid/grid.service';
import { SVGIcons } from '../../svg.generated';
=======
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
>>>>>>> d70575563f9dca8e07e176880a850ce1ccb0dfdf

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
  _queryTerm: string;
  // icons used within the template
  icon = {
    icSearch: SVGIcons['search'],
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
    this.queryTerm = searchQuery.term;

    if (searchQuery) {
      // execute the query and
      this.executeQuery();
    }
  }
  @Input() title: string;
  @Input() selectedItemId: string;
  // emits the current selection as list of object IDs
  @Output() itemsSelected = new EventEmitter<string[]>();

  // indicator that the component is busy loading data, so we are able to prevent user interaction
  @HostBinding('class.busy') busy: boolean = false;

  set queryTerm(term) {
    const pre = `${this.translate.instant('eo.search.term')}: `;
    this._queryTerm = term.includes('*') ? pre : `${pre}${term}`;
  }

  get queryTerm(): string {
    return this._queryTerm;
  }

  set hasPages(count) {
    this._hasPages = count;
  }

  get hasPages(): boolean {
    return this._hasPages;
  }

  constructor(
    private translate: TranslateService,
    private gridService: GridService,
    private searchService: SearchService,
    private fb: FormBuilder,
    private systemService: SystemService
  ) {
    this.title = this.translate.instant('eo.search.title');
    this.pagingForm = this.fb.group({
      page: ['']
    });
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
    this.resultListObjectTypeId = searchResult.objectTypes.length > 1 ? null : searchResult.objectTypes[0];

    this.gridService.getColumnConfiguration(this.resultListObjectTypeId).subscribe((colDefs: ColDef[]) => {
      // setup pagination form in case of a paged search result chunk
      this.pagination = null;
      this.hasPages = searchResult.items.length !== searchResult.totalNumItems;
      if (searchResult.totalNumItems > this._searchQuery.size) {
        this.pagination = {
          pages: Math.ceil(searchResult.totalNumItems / this._searchQuery.size),
          page: (!this._searchQuery.from ? 0 : this._searchQuery.from / this._searchQuery.size) + 1
        };

        this.pagingForm.get('page').setValue(pageNumber);
        this.pagingForm.get('page').setValidators([Validators.min(0), Validators.max(this.pagination.pages)]);
      }

      this._columns = colDefs;

      const rows = [];
      searchResult.items.forEach(i => {
        rows.push(this.getRow(i));
      });
      this._rows = rows;

      this.tableData = {
        columns: this._columns,
        rows: this._rows,
        titleField: SecondaryObjectTypeField.TITLE,
        descriptionField: SecondaryObjectTypeField.DESCRIPTION,
        selectType: 'single'
      };

      // setup current sort state from the query
      if (this._searchQuery.sortOptions.length) {
        // this._searchQuery.sortOptions.forEach((so: SortOption) => {

        //   // this._gridOptions.api.setSortModel([{colId: "enaio:creationDate", sort: "desc"}]);
        // })
        this.tableData.sortModel = this._searchQuery.sortOptions.map(o => ({
          colId: o.field,
          sort: o.order
        }));
      }

      this.busy = false;
    });
  }

  /**
   * Map search result item to a row data item
   */
  private getRow(searchResultItem: SearchResultItem): any {
    const row = {
      id: searchResultItem.fields.get(BaseObjectTypeField.OBJECT_ID)
    };
    this._columns.forEach((cd: ColDef) => {
<<<<<<< HEAD
      row[cd.field] = searchResultItem.fields.get(cd.field);
=======
      // ContentStream fields needs to be resolved in a different way.

      // Object type schema defines content related fields with a
      // special pattern we can check for.

      // Although defined in schema there may be no content attached.
      if (searchResultItem.content && cd.field.startsWith('enaio:contentStream')) {
        switch (cd.field) {
          case ContentStreamField.LENGTH: {
            row[cd.field] = searchResultItem.content.size;
            break;
          }
          case ContentStreamField.FILENAME: {
            row[cd.field] = searchResultItem.content.fileName;
            break;
          }
          case ContentStreamField.MIME_TYPE: {
            row[cd.field] = searchResultItem.content.mimeType;
            break;
          }
          // case 'enaio:contentStreamRange': {
          //   row[cd.field] = searchResultItem.content.range;
          //   break;
          // }
          // case 'enaio:contentStreamRepositoryId': {
          //   row[cd.field] = searchResultItem.content.repositoryId;
          //   break;
          // }
        }
      } else {
        row[cd.field] = searchResultItem.fields.get(cd.field);
      }
>>>>>>> d70575563f9dca8e07e176880a850ce1ccb0dfdf
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
      this.executeQuery();
    }
  }

  onColumnResized(colSizes: ColumnSizes) {
    this.gridService.persistColumnWidthSettings(colSizes, this.resultListObjectTypeId);
  }
}
