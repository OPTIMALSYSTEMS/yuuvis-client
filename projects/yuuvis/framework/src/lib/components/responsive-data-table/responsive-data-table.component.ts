import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridOptions, Module, RowEvent, RowHeightParams, RowNode } from '@ag-grid-community/core';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { BaseObjectTypeField, DeviceService, PendingChangesService, Utils } from '@yuuvis/core';
import { ResizedEvent } from 'angular-resize-event';
import { Observable, ReplaySubject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { ObjectTypeIconComponent } from '../../common/components/object-type-icon/object-type-icon.component';
import { LocaleDatePipe } from '../../pipes/locale-date.pipe';
import { ColumnSizes } from '../../services/grid/grid.interface';
import { SingleCellRendererComponent } from '../../services/grid/renderer/single-cell-renderer/single-cell-renderer.component';
import { LayoutService } from '../../services/layout/layout.service';
import { GridService } from './../../services/grid/grid.service';
import { ResponsiveTableData } from './responsive-data-table.interface';

/**
 * @ignore
 */
export type ViewMode = 'standard' | 'horizontal' | 'grid' | 'auto';

/**
 * Input data for a `ResponsiveDataTableComponent`
 */
export interface ResponsiveDataTableOptions {
  /** View mode type of a data table.
   * Can be `standard`, `horizontal`, `grid` or `auto`
   */
  viewMode?: ViewMode;
  /**
   * Object where the properties are the column IDs
   * and their values are the columns width.
   */

  columnWidths?: any;
}

/**
 * Responsive DataTable to show the search results.
 * 
 * [Screenshot](../assets/images/yuv-responsive-data-table.gif)
 * 
 * @example
 *     <yuv-responsive-data-table 
            [breakpoint]="" [layoutOptionsKey]="layoutOptionsKey" (selectionChanged)="onSelectionChanged($event)"
            (viewModeChanged)="onViewModeChanged.emit($event)" (sortChanged)="onSortChanged($event)">
          </yuv-responsive-data-table>
 */
@Component({
  selector: 'yuv-responsive-data-table',
  templateUrl: './responsive-data-table.component.html',
  styleUrls: ['./responsive-data-table.component.scss'],
  host: { class: 'yuv-responsive-data-table' },
  providers: [LocaleDatePipe]
})
export class ResponsiveDataTableComponent implements OnInit, OnDestroy {
  // internal subject for element size changes used for debouncing resize events
  private resizeSource = new ReplaySubject<ResizedEvent>();
  public resize$: Observable<ResizedEvent> = this.resizeSource.asObservable();
  // internal subject column size changes used for debouncing column resize events
  private columnResizeSource = new ReplaySubject<any>();
  public columnResize$: Observable<any> = this.columnResizeSource.asObservable();
  private _data: ResponsiveTableData;
  private _layoutOptions: ResponsiveDataTableOptions = {};
  // array of row IDs that are currently selected
  private _currentSelection: string[] = [];

  private settings = {
    headerHeight: { standard: 37, horizontal: 0, grid: 0 },
    rowHeight: { standard: 48, horizontal: 70, grid: 177 },
    colWidth: { standard: 'auto', horizontal: 'auto', grid: 177 },
    size: { newHeight: 0, newWidth: 0 }
  };

  gridOptions: GridOptions;

  public modules: Module[] = [ClientSideRowModelModule];

  @Output() rowDoubleClicked = new EventEmitter<RowEvent>();

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  private _layoutOptionsKey: string;
  @Input()
  set layoutOptionsKey(lok: string) {
    this._layoutOptionsKey = lok;
    this.layoutService
      .loadLayoutOptions(lok, 'yuv-responsive-data-table')
      .pipe(
        map((o: ResponsiveDataTableOptions) => {
          this._layoutOptions = o || {};
          if (this._layoutOptions.viewMode) {
            this.setupViewMode(this._layoutOptions.viewMode);
          }
          this.applyGridOption(true);
        })
      )
      .subscribe();
  }

  /**
   * ResponsiveTableData setter
   */
  @Input()
  set data(data: ResponsiveTableData) {
    this._data = data;
    this.gridOptions ? this.applyGridOption() : this.setupGridOptions();
  }
  get data(): ResponsiveTableData {
    return this._data;
  }

  /**
   * set selected rows for the table
   */
  @Input() set selection(selection: number | string[]) {
    setTimeout(() => {
      this.selectRows(selection);
      this.onSelectionChanged(null);
    }, 300);
  }

  /**
   * view mode of the table
   */
  @Input()
  set viewMode(viewMode: ViewMode) {
    this.setupViewMode(viewMode);
  }
  get viewMode() {
    return this._viewMode;
  }

  /**
   * Limit the number of selected rows
   */
  @Input() selectionLimit;

  set currentViewMode(viewMode: ViewMode) {
    if (this.currentViewMode !== viewMode) {
      this._currentViewMode = viewMode;
      this.viewModeChanged.emit(this._currentViewMode);
      this.applyGridOption();
    }
  }

  get currentViewMode() {
    return this._currentViewMode;
  }

  private get focusField() {
    return this._data.columns[0] ? this._data.columns[0].field : BaseObjectTypeField.OBJECT_TYPE_ID;
  }

  private _viewMode: ViewMode = 'standard';
  private _currentViewMode: ViewMode = 'standard';
  private _autoViewMode: ViewMode = 'standard';

  /**
   * width (number in pixel) of the table below which it should switch to small view
   */
  @Input() breakpoint = 400;

  /**
   * emits an array of the selected rows
   */
  @Output() selectionChanged = new EventEmitter<any[]>();

  /**
   * emits a sort information
   */
  @Output() sortChanged = new EventEmitter<{ colId: string; sort: string }[]>();
  /**
   * emits an array of the column sizes
   */
  @Output() columnResized = new EventEmitter<ColumnSizes>();
  /**
   * emitted when the view mode changes
   */
  @Output() viewModeChanged = new EventEmitter<ViewMode>();

  // @HostBinding('class.yuv-responsive-data-table') _hostClass = true;

  @HostBinding('class.small') get isSmall() {
    return this.currentViewMode !== 'standard';
  }
  @HostBinding('class.standard') get isStandard() {
    return this.currentViewMode === 'standard';
  }
  @HostBinding('class.horizontal') get isHorizontal() {
    return this.currentViewMode === 'horizontal';
  }
  @HostBinding('class.vertical') get isVertical() {
    return this.currentViewMode === 'grid' && this.settings.size.newHeight < this.settings.rowHeight.grid * 1.5;
  }
  @HostBinding('class.grid') get isGrid() {
    return this.currentViewMode === 'grid';
  }

  @HostListener('keydown.control.alt.shift.c', ['$event'])
  @HostListener('keydown.control.shift.c', ['$event'])
  @HostListener('keydown.control.alt.c', ['$event'])
  @HostListener('keydown.control.c', ['$event'])
  @HostListener('keydown.meta.alt.shift.c', ['$event'])
  @HostListener('keydown.meta.shift.c', ['$event'])
  @HostListener('keydown.meta.alt.c', ['$event'])
  @HostListener('keydown.meta.c', ['$event'])
  copyCellHandler(event: KeyboardEvent) {
    this.gridApi.copyToClipboard(event, this.gridOptions);
  }

  constructor(
    private pendingChanges: PendingChangesService,
    private elRef: ElementRef,
    public gridApi: GridService,
    private layoutService: LayoutService,
    private deviceService: DeviceService,
    private _ngZone: NgZone
  ) {
    // subscribe to the whole components size changing
    this.resize$
      .pipe(
        takeUntilDestroy(this)
        // debounceTime(500)
      )
      .subscribe(({ newRect }: ResizedEvent) => {
        const newHeight = newRect.height;
        const newWidth = newRect.width;
        this.settings.size = { newHeight, newWidth };
        this._autoViewMode = newHeight < this.breakpoint ? 'grid' : newWidth < this.breakpoint ? 'horizontal' : 'standard';
        if (this.viewMode === 'auto') {
          this.currentViewMode = this._autoViewMode;
        }
        const nodes = this.gridOptions.api?.getSelectedNodes();
        nodes?.length && this.ensureVisibility(nodes[0].rowIndex);
      });
    // subscribe to columns beeing resized
    this.columnResize$.pipe(takeUntilDestroy(this), debounceTime(500)).subscribe(() => {
      if (this.isStandard) {
        this.columnResized.emit({
          columns: this.gridOptions.columnApi.getColumnState().map((columnState) => ({
            id: columnState.colId,
            width: columnState.width
          }))
        });
        this._layoutOptions = {
          viewMode: this.viewMode,
          columnWidths: Utils.arrayToObject(this.gridOptions.columnApi.getColumnState(), 'colId', 'width')
        };
        this.layoutService.saveLayoutOptions(this._layoutOptionsKey, 'yuv-responsive-data-table', { ...this._layoutOptions }).subscribe();
      }
    });

    // subscribe to pending hanges
    this.pendingChanges.tasks$.pipe(takeUntilDestroy(this)).subscribe((tasks) => this.gridOptions && (this.gridOptions.suppressCellFocus = !!tasks.length));
  }

  getRowHeight(params: RowHeightParams): number {
    return 70;
  }

  /**
   * Set up the components view mode.
   * @param viewMode The view mode to be set up
   */
  private setupViewMode(viewMode: ViewMode) {
    this._layoutOptions.viewMode = viewMode;
    if (this._viewMode && this._viewMode !== viewMode) {
      this.layoutService.saveLayoutOptions(this._layoutOptionsKey, 'yuv-responsive-data-table', this._layoutOptions).subscribe();
    }
    this._viewMode = viewMode || 'standard';
    this.currentViewMode = this._viewMode === 'auto' ? this._autoViewMode : this._viewMode;
  }

  /**
   * Updates a row within the current row data. Will check if there is an entry matching the given ID
   * and update the fields inside the columns with matching values from the data input.
   * @param id The rows ID
   * @param data Updated row data. Only fields that match the rows column values will be updated,
   * although data may contain more fields. Data is supposed to be an object where the object
   * properties represent the fields keys holding and their value.
   */
  updateRow(id: string, data: any) {
    // check if ID is part of the current rows
    const matchRow = this._data.rows.find((r) => r.id === id);
    if (matchRow) {
      Object.keys(matchRow).forEach((k) => {
        matchRow[k] = data[k];
      });
      matchRow.id = id;
      const rowNode = this.gridOptions.api.getRowNode(id);
      rowNode.setData(matchRow);
    }
  }

  /**
   * Deletes a row with a given row id.
   * Returns a boolean, which indicates, if the row was deleted or not.
   * @param id The rows ID
   * @returns
   */
  deleteRow(id: string): boolean {
    const rowNode = this.gridOptions.api ? this.gridOptions.api.getRowNode(id) : undefined;
    if (rowNode) {
      this.gridOptions.api.applyTransaction({ remove: [rowNode] });
      return true;
    } else {
      return false;
    }
  }

  private applyColDefOptions(columns: ColDef[]): ColDef[] {
    if (this._layoutOptions && this._layoutOptions.columnWidths) {
      columns.forEach((c) => {
        if (this._layoutOptions.columnWidths[c.colId]) {
          c.width = this._layoutOptions.columnWidths[c.colId];
        }
      });
    }
    if (!this.deviceService.isDesktop) {
      const first = columns.find((c) => c.pinned === 'left' || c.pinned === true) || columns[0];
      first.checkboxSelection = true;
    }
    return columns;
  }

  private applyGridOption(retry: boolean = true) {
    if (this.isReady()) {
      // make sure that all rows are visible / loaded
      this.gridOptions.rowBuffer = this.isSmall ? 1000 : undefined;
      this.gridOptions.api.setRowData(this._data.rows);
      this.gridOptions.api.setHeaderHeight(this.settings.headerHeight[this.currentViewMode]);

      const _columnDefs = JSON.stringify(this.gridOptions.columnDefs);
      const columns = this.applyColDefOptions(this.isSmall ? [this.getSmallSizeColDef()] : this._data.columns);

      if (_columnDefs !== JSON.stringify(columns)) {
        this.gridOptions.columnDefs = columns;
        this.gridOptions.api.setColumnDefs(columns);
        this.gridOptions.columnApi.resetColumnState();
      }

      if (this.isStandard && this._data.sortModel) {
        this.setSortModel([...this._data.sortModel]);
      }
      const hidden = this.elRef.nativeElement.getBoundingClientRect().width === 0;
      if (this.isSmall && !hidden) {
        // gridOptions to be applied for the small view.
        // Those options rely on the grids DOM element, so we need to keep track
        // if the grid is currently visible (has a width)
        this.gridOptions.columnApi.autoSizeAllColumns();
        this.gridOptions.api.sizeColumnsToFit();
      }

      // if the small state changed, a different set of rowData is applied to the grid
      // so we need to reselect the items that were selected before
      this.selectRows(this._currentSelection);
      this.gridOptions.api.redrawRows();
    } else if (retry) {
      setTimeout(() => this.applyGridOption(false), 0);
    }
  }

  private getSmallSizeColDef(): ColDef {
    const colDef: ColDef = {
      colId: Utils.uuid(), // has to be unique
      field: BaseObjectTypeField.OBJECT_ID,
      cellClass: this._data.singleColumnCellClass || 'cell-title-description',
      minWidth: this.isGrid ? this._data.rows.length * this.settings.colWidth.grid : 0,
      valueGetter: (params) => JSON.stringify(params.data) // needed to compare value changes & redraw cell
    };

    if (this._data.singleColumnCellRenderer) {
      colDef.cellRenderer = this._data.singleColumnCellRenderer;
    } else {
      colDef.cellRenderer = 'singleCellRenderer';
      colDef.cellRendererParams = {
        _crParams: {
          titleField: this._data.titleField,
          descriptionField: this._data.descriptionField,
          dateField: this._data.dateField,
          viewMode: this._currentViewMode
        }
      };
    }
    return colDef;
  }

  clearSelection() {
    this.gridOptions.api.deselectAll();
  }

  /**
   * select rows based on list of IDs
   * @param selection default is first row
   */
  selectRows(selection: number | string[] = 0, focusColId?: string, ensureVisibility: boolean = true) {
    const _selection = this.gridOptions.api?.getSelectedNodes().map((n) => n.id) || [];
    const sel = typeof selection === 'number' ? [this._data.rows[selection]?.id] : selection || [];
    if (!this.gridOptions.api || sel.sort().join() === _selection.sort().join()) return;
    this.gridOptions.api.clearFocusedCell();
    this.gridOptions.api.deselectAll();
    sel.forEach((id: string, index: number) => {
      const n = this.gridOptions.api.getRowNode(id);
      if (n) {
        if (index === 0) {
          this.gridOptions.api.setFocusedCell(n.rowIndex, focusColId || this.focusField);
          if (ensureVisibility) {
            this.ensureVisibility(n.rowIndex);
          }
        }
        n.setSelected(true, index === 0);
      }
    });
  }

  private ensureVisibility(rowIndex = 0) {
    if (this.isVertical) {
      const shift = Math.floor(this.settings.size.newWidth / this.settings.colWidth.grid / 2);
      this.gridOptions.api['ctrlsService'].centerRowContainerCtrl.setCenterViewportScrollLeft(Math.max(0, (rowIndex - shift) * this.settings.colWidth.grid));
    } else if (this.isGrid) {
      this.gridOptions.api.ensureIndexVisible(Math.floor(rowIndex / Math.floor(this.settings.size.newWidth / this.settings.colWidth.grid)));
    } else {
      this.gridOptions.api.ensureIndexVisible(rowIndex);
    }
  }

  getSortModel() {
    return this.gridOptions.columnApi
      .getColumnState()
      .map(({ colId, sort }) => ({ colId, sort }))
      .filter(({ sort }) => sort);
  }

  setSortModel(model: any[]) {
    this.gridOptions.columnApi.applyColumnState({
      state: this.gridOptions.columnApi.getColumnState().map((c) => ({ ...c, ...(model.find((m) => m.colId === c.colId) || { sort: null }) }))
    });
  }

  private setupGridOptions() {
    this.gridOptions = {
      // defines what to use as ID for each row (important for reselecting a previous selection)
      getRowId: (params) => params.data?.id,
      getRowHeight: () => this.settings.rowHeight[this.currentViewMode],
      rowData: this._data.rows,
      columnDefs: this._layoutOptionsKey ? [] : this._data.columns,
      headerHeight: this.settings.headerHeight.standard,
      rowHeight: this.settings.rowHeight.standard,
      suppressCellFocus: false,
      rowSelection: this._data.selectType || 'single',
      suppressNoRowsOverlay: true,
      multiSortKey: 'ctrl',
      ...this._data?.gridOptions,
      components: {
        objectTypeCellRenderer: ObjectTypeIconComponent,
        singleCellRenderer: SingleCellRendererComponent,
        ...this._data?.gridOptions?.frameworkComponents
      }
    };
  }

  onSelectionChanged(event) {
    const focused = this.gridOptions.api?.getFocusedCell() || { rowIndex: -1 };
    const selection = this.gridOptions.api?.getSelectedNodes().sort((n) => (n.rowIndex === focused.rowIndex ? -1 : 0)) || [];
    if (this.selectionLimit && selection.length > this.selectionLimit) {
      selection.forEach((node, i) => i >= this.selectionLimit && node.setSelected(false));
    } else if (!event || selection.map((rowNode: RowNode) => rowNode.id).join() !== (this._currentSelection || []).join()) {
      this._currentSelection = selection.map((rowNode: RowNode) => rowNode.id);
      // ag-grid bug on mobile - issue with change detection after touch event
      this._ngZone.run(() => {
        this.selectionChanged.emit(selection.map((rowNode: RowNode) => rowNode.data));
        if (selection?.length) {
          this.ensureVisibility(selection[0].rowIndex);
        }
      });
    }
  }

  onRowDoubleClicked = (event) => this.rowDoubleClicked.emit(event);
  onColumnResized = (event) => this.columnResizeSource.next(event);
  onSortChanged = (event) => this.isStandard && this.sortChanged.emit(this.getSortModel());

  onGridReady(event) {
    this.setSortModel(this._data.sortModel || []);
    this.gridOptions.api?.setFocusedCell(0, this.focusField);
  }

  onMouseDown($event: MouseEvent | any) {
    // TODO: find the solution for mobile / touch event
    if (this.deviceService.isDesktop && $event.button === 0 && this.gridOptions && this.gridOptions.suppressCellFocus) {
      if (!this.pendingChanges.check()) {
        this.gridOptions.suppressCellFocus = false;

        this.selectEvent($event);
      } else {
        $event.preventDefault();
        $event.stopImmediatePropagation();
      }
    }
  }

  private selectEvent($event: MouseEvent | any) {
    const colEl = ($event.composedPath ? $event.composedPath() : []).find((el) => el && el.getAttribute('col-id'));
    if (colEl) {
      this.selectRows([colEl.parentElement.getAttribute('row-id')], colEl.getAttribute('col-id'), false);
      this.onSelectionChanged(null);
    }
  }

  /**
   * custom event handler
   * @param e
   */
  onResized(e: ResizedEvent) {
    this.resizeSource.next(e);
  }

  isReady() {
    return !!(this.gridOptions && this.gridOptions.api);
  }

  ngOnInit() {}

  ngOnDestroy() {}
}
