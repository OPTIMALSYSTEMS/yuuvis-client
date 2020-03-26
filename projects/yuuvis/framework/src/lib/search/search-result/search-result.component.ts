import { ColDef, RowEvent } from '@ag-grid-community/core';
import { Attribute, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconRegistryService } from '@yuuvis/common-ui';
import {
  BaseObjectTypeField,
  ColumnConfig,
  ColumnConfigColumn,
  DmsObject,
  EventService,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchService,
  SecondaryObjectTypeField,
  SortOption,
  UserConfigService,
  YuvEvent,
  YuvEventType
} from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { ResponsiveDataTableComponent, ViewMode } from '../../components/responsive-data-table/responsive-data-table.component';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { GridService } from '../../services/grid/grid.service';
import { arrowLast, arrowNext, clear, listModeDefault, listModeGrid, listModeSimple, search, settings } from '../../svg.generated';

/**
 * Component rendering a search result within a result list.
 * Adding `applyColumnConfig` attribute and set it to true will apply the users
 * result list column configuration.
 */
@Component({
  selector: 'yuv-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  host: { class: 'yuv-search-result' }
})
export class SearchResultComponent implements OnDestroy {
  private _searchQuery: SearchQuery;
  private _columns: ColDef[];
  private _rows: any[];
  private _hasPages = false;
  private _itemsSupposedToBeSelected: string[];
  pagingForm: FormGroup;
  busy: boolean;

  tableData: ResponsiveTableData;
  // object type shown in the result list, will be null for mixed results
  private resultListObjectTypeId: string;
  totalNumItems: number;
  // state of pagination
  pagination: {
    pages: number;
    page: number;
  };

  // @Input() options: ResponsiveDataTableOptions;

  @ViewChild('dataTable', { static: false }) dataTable: ResponsiveDataTableComponent;

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() layoutOptionsKey: string;
  /**
   * Query to be executed by the component.
   */
  @Input() set query(searchQuery: SearchQuery) {
    this._searchQuery = searchQuery;
    if (searchQuery) {
      this.executeQuery(this.applyColumnConfig);
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
   * The IDs of the items supposed to be selected upfront. This is only going one direction.
   * If the items are not part of the actual table data, nothing will be selected.
   */
  @Input() set preSelectItems(ids: string[]) {
    this._itemsSupposedToBeSelected = ids;
    this.setSelection(ids);
  }
  /**
   * Emits the current selection as list of object IDs
   */
  @Output() itemsSelected = new EventEmitter<string[]>();
  @Output() rowDoubleClicked = new EventEmitter<RowEvent>();
  /**
   * emitted when the view mode of the underlying data table changes
   */
  @Output() viewModeChanged = new EventEmitter<ViewMode>();

  set hasPages(count) {
    this._hasPages = count;
  }

  get hasPages(): boolean {
    return this._hasPages;
  }

  /**
   * view mode of the table
   */
  @Input() set viewMode(viewMode: ViewMode) {
    if (this.dataTable) {
      this.dataTable.viewMode = this.dataTable.viewMode !== viewMode ? viewMode : 'auto';
    }
  }

  constructor(
    @Attribute('applyColumnConfig') public applyColumnConfig: boolean,
    private gridService: GridService,
    private userConfig: UserConfigService,
    private eventService: EventService,
    private searchService: SearchService,
    private fb: FormBuilder,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([settings, clear, search, arrowNext, arrowLast, listModeDefault, listModeGrid, listModeSimple]);

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

    this.eventService
      .on(YuvEventType.DMS_OBJECT_DELETED)
      .pipe(takeUntilDestroy(this))
      .subscribe(event => {
        const deleted = this.dataTable.deleteRow(event.data.id);
        if (deleted) {
          this.totalNumItems--;
        }
      });
  }

  /**
   * re-run the current query
   */
  refresh(applyColumnConfig?: boolean) {
    this.executeQuery(applyColumnConfig);
  }

  private executeQuery(applyColumnConfig?: boolean) {
    this.busy = true;
    (applyColumnConfig ? this.applyColumnConfiguration(this._searchQuery) : of(this._searchQuery))
      .pipe(switchMap((q: SearchQuery) => this.searchService.search(q)))
      .subscribe((res: SearchResult) => {
        this.totalNumItems = res.totalNumItems;
        this.createTableData(res);
      });
  }

  private applyColumnConfiguration(q: SearchQuery): Observable<SearchQuery> {
    const targetType = q.types && q.types.length === 1 ? q.types[0] : null;
    return this.userConfig.getColumnConfig(targetType).pipe(
      tap((cc: ColumnConfig) => {
        q.sortOptions = [];
        cc.columns
          .filter(c => !!c.sort)
          .forEach(c => {
            q.addSortOption(c.id, c.sort);
          });
      }),
      map((cc: ColumnConfig) => cc.columns.map((column: ColumnConfigColumn) => column.id)),
      tap((fields: string[]) => (q.fields = [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.OBJECT_TYPE_ID, ...fields])),
      switchMap(() => of(q))
    );
  }

  // Create actual table data from the search result
  private createTableData(searchResult: SearchResult, pageNumber = 1): void {
    // object type of the result list items, if NULL we got a mixed result
    // const id = searchResult.objectTypes.length > 1 ? null : searchResult.objectTypes[0];
    let objecttypeId;
    if (this._searchQuery) {
      objecttypeId = this._searchQuery.types.length > 1 ? null : this._searchQuery.types[0] || null;
    }

    this.gridService.getColumnConfiguration(objecttypeId).subscribe((colDefs: ColDef[]) => {
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

      // // TODO: setup column width
      // if (this.options && this.options.columnWidths) {
      //   colDefs.forEach(col => (col.width = this.options.columnWidths[col.field] || col.width));
      // }

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
      setTimeout(_ => {
        this.setSelection(this._itemsSupposedToBeSelected);
      }, 0);
    });
  }

  /**
   * Map search result item to a row data item
   */
  private getRow(searchResultItem: SearchResultItem): any {
    const row = {
      id: searchResultItem.fields.get(BaseObjectTypeField.OBJECT_ID),
      [BaseObjectTypeField.OBJECT_TYPE_ID]: searchResultItem.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID),
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

  private setSelection(ids: string[]) {
    if (this.dataTable && this.tableData && this.tableData.rows.length) {
      this.dataTable.selectRows(ids);
    }
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
      // TODO: Reimplement persisting settings comming from the grid (...should we support that at all?)
      // this.gridService.persistSortSettings(this._searchQuery.sortOptions, this.resultListObjectTypeId);
    }
  }

  ngOnDestroy() {}
}
