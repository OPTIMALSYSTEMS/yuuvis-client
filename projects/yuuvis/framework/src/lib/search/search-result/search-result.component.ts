import { ColDef, RowEvent } from '@ag-grid-community/core';
import { Attribute, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {
  BaseObjectTypeField,
  DmsObject,
  EventService,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchService,
  SortOption,
  SystemService,
  UserConfigService,
  Utils,
  YuvEvent,
  YuvEventType
} from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { ResponsiveDataTableComponent, ViewMode } from '../../components/responsive-data-table/responsive-data-table.component';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { GridService } from '../../services/grid/grid.service';
import { arrowLast, arrowNext, clear, doubleArrow, filter, listModeDefault, listModeGrid, listModeSimple, search, settings } from '../../svg.generated';

export interface FilterPanelConfig {
  open: boolean;
  width: number;
}

/**
 * Component rendering a search result within a result list.
 * Adding `applyColumnConfig` attribute and set it to true will apply the users
 * result list column configuration.
 *
 * @example
 * <yuv-search-result [query]="searchQuery" (itemsSelected)="select($event)"></yuv-search-result>
 */
@Component({
  selector: 'yuv-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  host: { class: 'yuv-search-result' }
})
export class SearchResultComponent implements OnDestroy {
  // default and minimal size of the filter panel in pixel
  filterPanelSize = {
    default: 250,
    min: 200
  };

  private _originalQuery: SearchQuery;
  private _searchQuery: SearchQuery;
  private _columns: ColDef[];
  private _rows: any[];
  private _itemsSupposedToBeSelected: string[];
  // private _showFilterPanel: boolean;
  private _filterPanelConfig: FilterPanelConfig = {
    open: false,
    width: this.filterPanelSize.default
  };
  pagingForm: UntypedFormGroup;
  busy: boolean;
  private objectTypeBaseProperties = this.system.getBaseProperties();
  /**
   * Column configuration to be used for the grid. The query sent to the backend
   * will be adopted to fetch all the necessary fields.
   */
  @Input() columnConfig: ColDef[];

  @Input() set filterPanelConfig(cfg: FilterPanelConfig) {
    if (this._filterPanelConfig?.open !== cfg?.open || this._filterPanelConfig.width !== cfg?.width) {
      this._filterPanelConfig = cfg || {
        open: false,
        width: this.filterPanelSize.default
      };
      this.filterPanelConfigChanged.emit(cfg);
    }
  }

  get filterPanelConfig() {
    return this._filterPanelConfig;
  }

  @Input() responsiveTableData: Partial<ResponsiveTableData>;

  tableData: ResponsiveTableData;
  totalNumItems: number;
  // state of pagination
  pagination: {
    pages: number;
    page: number;
  };

  @ViewChild('dataTable') dataTable: ResponsiveDataTableComponent;

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() layoutOptionsKey: string;

  @Input() disableFilterPanel: boolean;
  /**
   * Query to be executed by the component.
   */
  @Input() set query(searchQuery: SearchQuery) {
    if (this.dataTable?.gridOptions?.api?.getSelectedNodes().length) {
      this.itemsSelected.emit([]);
    }

    this._originalQuery = searchQuery && new SearchQuery(searchQuery.toQueryJson());
    this._searchQuery = searchQuery && new SearchQuery(searchQuery.toQueryJson());
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
   * Emitted when the query has been changed from within the component
   */
  @Output() queryChanged = new EventEmitter<SearchQuery>();

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
  /**
   * Emitted when the visibility or width of the filter panel changes
   */
  @Output() filterPanelConfigChanged = new EventEmitter<FilterPanelConfig>();

  /**
   * view mode of the table
   */
  @Input() set viewMode(viewMode: ViewMode) {
    if (this.dataTable) {
      this.dataTable.viewMode = this.dataTable.viewMode !== viewMode ? viewMode : 'auto';
    }
  }

  get viewMode() {
    return this.dataTable ? this.dataTable.viewMode : null;
  }

  get sortOptionsChanged() {
    return JSON.stringify(this._originalQuery?.sortOptions || []) !== JSON.stringify(this._searchQuery?.sortOptions || []);
  }

  constructor(
    @Attribute('applyColumnConfig') public applyColumnConfig: any, // string should be resolved
    private gridService: GridService,
    private userConfig: UserConfigService,
    private system: SystemService,
    private eventService: EventService,
    private searchService: SearchService,
    private fb: UntypedFormBuilder,
    private iconRegistry: IconRegistryService
  ) {
    this.applyColumnConfig = !applyColumnConfig || applyColumnConfig === 'false' ? false : true;
    this.iconRegistry.registerIcons([doubleArrow, filter, settings, clear, search, arrowNext, arrowLast, listModeDefault, listModeGrid, listModeSimple]);

    this.pagingForm = this.fb.group({ page: [''] });

    this.eventService
      .on(YuvEventType.DMS_OBJECT_UPDATED, YuvEventType.DMS_OBJECT_DELETED)
      .pipe(
        takeUntilDestroy(this),
        tap((e) => this.objectEvent(e))
      )
      .subscribe((e: YuvEvent) => {});
  }

  private objectEvent({ type, data }: YuvEvent) {
    if (type === YuvEventType.DMS_OBJECT_UPDATED) {
      const dmsObject = data as DmsObject;
      if (this.dataTable) {
        // Update table data without reloading the whole grid
        this.dataTable.updateRow(dmsObject.id, dmsObject.data);
      }
    } else if (type === YuvEventType.DMS_OBJECT_DELETED) {
      if (this.dataTable) {
        const deleted = this.dataTable.deleteRow(data.id);
        if (deleted) {
          this.totalNumItems--;
          if (this.pagination?.pages) {
            this.pagination.pages = Math.ceil(this.totalNumItems / this._searchQuery.size);
          }
        }
      }
    }
  }

  setFilterPanelVisibility(v: boolean) {
    if (this._filterPanelConfig?.open !== v) {
      this._filterPanelConfig.open = v;
      this.filterPanelConfigChanged.emit(this._filterPanelConfig);
    }
  }

  gutterDragEnd(evt: any) {
    console.log(evt);
    if (this._filterPanelConfig.width !== evt.sizes[0]) {
      this._filterPanelConfig.width = evt.sizes[0];
      this.filterPanelConfigChanged.emit(this._filterPanelConfig);
    }
  }

  /**
   * re-run the current query
   */
  refresh(applyColumnConfig?: boolean) {
    this.executeQuery(applyColumnConfig);
  }

  private executeQuery(applyColumnConfig?: boolean) {
    this.busy = true;
    this._searchQuery.from = 0; // always load 1st page
    (applyColumnConfig ? this.applyColumnConfiguration(this._searchQuery) : of(this._searchQuery))
      .pipe(
        tap((q) => this.queryChanged.emit(q)),
        switchMap((q: SearchQuery) => this.searchService.search(q))
      )
      .subscribe((res: SearchResult) => {
        this.createTableData(res);
      });
  }

  private applyColumnConfiguration(q: SearchQuery): Observable<SearchQuery> {
    return (this.columnConfig ? of(this.columnConfig) : this.gridService.getColumnConfiguration(q.targetType)).pipe(
      tap((colDefs: ColDef[]) => {
        q.sortOptions = [];
        colDefs
          .filter((c) => !!c.sort)
          .forEach((c) => {
            q.addSortOption(c.colId, c.sort);
          });

        q.fields = [
          ...q.fields,
          // required for SingleCellRendering allthough the object may not have those fields
          this.objectTypeBaseProperties.title,
          this.objectTypeBaseProperties.description,
          // stuff that's always needed
          BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS,
          BaseObjectTypeField.OBJECT_ID,
          BaseObjectTypeField.OBJECT_TYPE_ID,
          BaseObjectTypeField.PARENT_ID,
          ...colDefs.filter((c) => !c.colId.startsWith(GridService.AGGREGATED_COLUMN_PREFIX)).map((c) => c.colId)
        ];

        this._columns = colDefs;
        this._originalQuery = new SearchQuery(q.toQueryJson());
      }),
      switchMap(() => of(q))
    );
  }

  // Create actual table data from the search result
  private createTableData(searchResult: SearchResult, pageNumber = 1): void {
    this.totalNumItems = searchResult.totalNumItems;
    // object type of the result list items, if NULL we got a mixed result
    const targetType = this._searchQuery?.targetType;

    (this._columns ? of(this._columns) : this.gridService.getColumnConfiguration(targetType)).subscribe((colDefs: ColDef[]) => {
      // setup pagination form in case of a paged search result chunk
      this.pagination = null;
      if (this._searchQuery && searchResult.totalNumItems > this._searchQuery.size) {
        this.pagination = {
          pages: Math.ceil(searchResult.totalNumItems / this._searchQuery.size),
          page: (!this._searchQuery.from ? 0 : this._searchQuery.from / this._searchQuery.size) + 1
        };

        this.pagingForm.get('page').setValue(pageNumber);
        this.pagingForm
          .get('page')
          .setValidators([Validators.required, , Validators.pattern('[0-9]+'), Validators.min(1), Validators.max(this.pagination.pages)]);
      }

      // // TODO: setup column width
      // if (this.options && this.options.columnWidths) {
      //   colDefs.forEach(col => (col.width = this.options.columnWidths[col.field] || col.width));
      // }

      this._columns = colDefs;
      this._rows = searchResult.items.map((i) => this.getRow(i));
      const sortOptions = this._searchQuery ? this._searchQuery.sortOptions || [] : [];

      const setter = this.responsiveTableData?.set || ((t) => t);
      this.tableData = setter.call(this, {
        titleField: this.objectTypeBaseProperties.title,
        descriptionField: this.objectTypeBaseProperties.description,
        selectType: 'multiple',
        columns: this._columns,
        rows: this._rows,
        sortModel: sortOptions.map((o) => ({
          colId: o.field,
          sort: o.order
        })),
        ...(this.responsiveTableData || {})
      });
      this.busy = false;
      setTimeout((_) => {
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
      [BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]: searchResultItem.fields.get(BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS),
      [this.objectTypeBaseProperties.title]: searchResultItem.fields.get(this.objectTypeBaseProperties.title),
      [this.objectTypeBaseProperties.description]: searchResultItem.fields.get(this.objectTypeBaseProperties.description)
    };
    this._columns.forEach((cd: ColDef) => {
      row[cd.field] = searchResultItem.fields.get(cd.field);
      if (searchResultItem.fields.get(cd.field + '_title')) {
        row[cd.field + '_title'] = searchResultItem.fields.get(cd.field + '_title');
      }
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
      (err) => {
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
    this.itemsSelected.emit(selectedRows.map((r) => r.id));
  }

  onSortChanged(sortModel: { colId: string; sort: string }[]) {
    if (JSON.stringify(this.tableData.sortModel.sort(Utils.sortValues('colId'))) !== JSON.stringify(sortModel.sort(Utils.sortValues('colId')))) {
      // change query to reflect the sort setting from the grid
      this._searchQuery.sortOptions = sortModel.map((m) => new SortOption(m.colId, m.sort));
      this.executeQuery();
    }
  }

  onFilterChanged(filterQuery: SearchQuery) {
    const applyColumnConfig = this._searchQuery.targetType !== filterQuery.targetType;
    this._searchQuery.types = filterQuery.types;
    this._searchQuery.lots = filterQuery.lots;
    this._searchQuery.filterGroup = filterQuery.filterGroup;
    this.executeQuery(applyColumnConfig);
  }

  ngOnDestroy() {}
}
