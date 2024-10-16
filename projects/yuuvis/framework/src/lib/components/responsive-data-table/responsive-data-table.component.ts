import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, Module, RowEvent, RowNode } from '@ag-grid-community/core';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseObjectTypeField, DeviceService, PendingChangesService, Utils } from '@yuuvis/core';
import { NgxResize, NgxResizeResult } from 'ngx-resize';
import { Observable, ReplaySubject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { ObjectTypeIconComponent } from '../../common/components/object-type-icon/object-type-icon.component';
import { LocaleDatePipe } from '../../pipes/locale-date.pipe';
import { PluginsService } from '../../plugins/plugins.service';
import { ColumnSizes } from '../../services/grid/grid.interface';
import { SingleCellRendererComponent } from '../../services/grid/renderer/single-cell-renderer/single-cell-renderer.component';
import { LayoutService } from '../../services/layout/layout.service';
import { ViewMode } from '../../shared/utils/utils';
import { GridService } from './../../services/grid/grid.service';
import { ResponsiveTableData } from './responsive-data-table.interface';

/**
 * Input data for a `ResponsiveDataTableComponent`
 */
export interface ResponsiveDataTableOptions {
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
  hostDirectives: [{ directive: NgxResize, outputs: ['ngxResize'] }],
  providers: [LocaleDatePipe]
})
export class ResponsiveDataTableComponent implements OnInit, OnDestroy {
  private id = '#grid_' + Utils.uuid();
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  // internal subject for element size changes used for debouncing resize events
  private resizeSource = new ReplaySubject<NgxResizeResult>();
  public resize$: Observable<NgxResizeResult> = this.resizeSource.asObservable();
  // internal subject column size changes used for debouncing column resize events
  private columnResizeSource = new ReplaySubject<any>();
  public columnResize$: Observable<any> = this.columnResizeSource.asObservable();
  private _data: ResponsiveTableData;
  private _layoutOptions: ResponsiveDataTableOptions = {};
  // array of row IDs that are currently selected
  private _currentSelection: string[] = [];

  private settings = {
    headerHeight: { standard: 37, horizontal: 0, grid: 0 },
    rowHeight: { standard: 70, horizontal: 70, grid: 177 },
    colWidth: { standard: 'auto', horizontal: 'auto', grid: 177 },
    size: { newHeight: 0, newWidth: 0 }
  };

  gridOptions: GridOptions;

  get api(): GridApi {
    return this.agGrid?.api;
  }

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
    }, 500);
  }

  @Input()
  set rowHeight(rowHeight: number) {
    if (rowHeight && rowHeight !== this.settings.rowHeight.standard) {
      this.settings.rowHeight.standard = rowHeight;
      this.api?.resetRowHeights();
    }
  }
  get rowHeight() {
    return this.settings.rowHeight.standard;
  }

  private _viewMode: ViewMode = 'auto';
  private _currentViewMode: ViewMode = 'standard';
  private _autoViewMode: ViewMode = 'standard';

  /**
   * view mode of the table
   */
  @Input()
  set viewMode(viewMode: ViewMode) {
    this._viewMode = viewMode || 'auto';
    const currentViewMode = this._viewMode === 'auto' ? this._autoViewMode : this._viewMode;
    if (this._viewMode === 'auto' || this.currentViewMode !== currentViewMode) {
      this._currentViewMode = currentViewMode;
      this.viewModeChanged.emit(this._currentViewMode);
      this.applyGridOption();
    }
  }

  get viewMode() {
    return this._viewMode;
  }

  get currentViewMode() {
    return this._currentViewMode;
  }

  /**
   * Limit the number of selected rows
   */
  @Input() selectionLimit;

  private get focusField() {
    return this._data.columns[0] ? this._data.columns[0].field : BaseObjectTypeField.OBJECT_TYPE_ID;
  }

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
    this.gridApi.copyToClipboard(event, this.agGrid, this.gridOptions);
  }

  constructor(
    private pendingChanges: PendingChangesService,
    private elRef: ElementRef,
    public gridApi: GridService,
    private layoutService: LayoutService,
    private deviceService: DeviceService,
    private _ngZone: NgZone,
    private pluginsService: PluginsService
  ) {
    this.pluginsService.register(this);
    // subscribe to the whole components size changing
    this.resize$
      .pipe(
        takeUntilDestroyed()
        // debounceTime(500)
      )
      .subscribe((resize: NgxResizeResult) => {
        const newHeight = resize.height;
        const newWidth = resize.width;
        this.settings.size = { newHeight, newWidth };
        this._autoViewMode = newHeight < this.breakpoint ? 'grid' : newWidth < this.breakpoint ? 'horizontal' : 'standard';
        if (this.viewMode === 'auto') {
          this.viewMode = 'auto'; // force autoViewMode refresh
        }
        const nodes = this.api?.getSelectedNodes();
        nodes?.length && this.ensureVisibility(nodes[0].rowIndex);
      });
    // subscribe to columns beeing resized
    this.columnResize$.pipe(takeUntilDestroyed(), debounceTime(500)).subscribe(() => {
      if (this.isStandard && this.api) {
        this.columnResized.emit({
          columns: this.api.getColumnState().map((columnState) => ({
            id: columnState.colId,
            width: columnState.width
          }))
        });
        this._layoutOptions = {
          columnWidths: Utils.arrayToObject(this.api.getColumnState(), 'colId', 'width')
        };
        this.layoutService.saveLayoutOptions(this._layoutOptionsKey, 'yuv-responsive-data-table', { ...this._layoutOptions }).subscribe();
      }
    });

    // subscribe to pending hanges
    this.pendingChanges.tasks$.pipe(takeUntilDestroyed())
      .subscribe((tasks) => this.api?.updateGridOptions({ suppressRowClickSelection: !!tasks.length, suppressCellFocus: !!tasks.length }));
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
      const rowNode = this.api?.getRowNode(id);
      rowNode && rowNode.setData(matchRow);
    }
  }

  /**
   * Deletes a row with a given row id.
   * Returns a boolean, which indicates, if the row was deleted or not.
   * @param id The rows ID
   * @returns
   */
  deleteRow(id: string): boolean {
    const rowNode = this.api?.getRowNode(id);
    if (rowNode) {
      this.api.applyTransaction({ remove: [rowNode] });
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
      this.api.setGridOption('rowBuffer', this.isSmall ? 1000 : undefined);
      this.api.setGridOption('rowData', this._data.rows);
      this.api.setGridOption('headerHeight', this.settings.headerHeight[this.currentViewMode]);
      this.api.resetRowHeights();

      const _columnDefs = JSON.stringify(this.gridOptions.columnDefs);
      const columns = this.applyColDefOptions(this.isSmall ? [this.getSmallSizeColDef()] : this._data.columns);

      if (_columnDefs !== JSON.stringify(columns)) {
        this.gridOptions.columnDefs = columns;
        this.api.updateGridOptions({ columnDefs: columns });
        this.api.resetColumnState();
      }

      if (this.isStandard && this._data.sortModel) {
        this.setSortModel([...this._data.sortModel]);
      }
      const hidden = this.elRef.nativeElement.getBoundingClientRect().width === 0;
      if (this.isSmall && !hidden) {
        // gridOptions to be applied for the small view.
        // Those options rely on the grids DOM element, so we need to keep track
        // if the grid is currently visible (has a width)
        this.api.autoSizeAllColumns();
        this.api.sizeColumnsToFit();
      }

      // if the small state changed, a different set of rowData is applied to the grid
      // so we need to reselect the items that were selected before
      this.selectRows(this._currentSelection);
      this.api.redrawRows();
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
    this.api?.deselectAll();
  }

  /**
   * select rows based on list of IDs
   * @param selection default is first row
   */
  selectRows(selection: number | string[] = 0, focusColId?: string, ensureVisibility: boolean = true) {
    const _selection = this.api?.getSelectedNodes().map((n) => n.id) || [];
    const sel = typeof selection === 'number' ? [this._data.rows[selection]?.id] : selection || [];
    if (!this.api || sel.sort().join() === _selection.sort().join()) return;
    this.api.clearFocusedCell();
    this.api.deselectAll();
    sel.forEach((id: string, index: number) => {
      const n = this.api.getRowNode(id);
      if (n) {
        if (index === 0) {
          this.api.setFocusedCell(n.rowIndex, focusColId || this.focusField);
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
      this.api['ctrlsService'].centerRowContainerCtrl.setCenterViewportScrollLeft(Math.max(0, (rowIndex - shift) * this.settings.colWidth.grid));
    } else if (this.isGrid) {
      this.api?.ensureIndexVisible(Math.floor(rowIndex / Math.floor(this.settings.size.newWidth / this.settings.colWidth.grid)));
    } else {
      this.api?.ensureIndexVisible(rowIndex);
    }
  }

  getSortModel() {
    return this.api
      ?.getColumnState()
      .map(({ colId, sort }) => ({ colId, sort }))
      .filter(({ sort }) => sort);
  }

  setSortModel(model: any[]) {
    this.api?.applyColumnState({
      state: this.api?.getColumnState().map((c) => ({ ...c, ...(model.find((m) => m.colId === c.colId) || { sort: null }) }))
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
        ...this._data?.gridOptions?.components
      }
    };
  }

  onSelectionChanged(event) {
    const focused = this.api?.getFocusedCell() || { rowIndex: -1 };
    const selection = this.api?.getSelectedNodes().sort((n) => (n.rowIndex === focused.rowIndex ? -1 : 0)) || [];
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
    this.api?.setFocusedCell(0, this.focusField);
  }

  onMouseDown($event: MouseEvent | any) {
    // TODO: find the solution for mobile / touch event
    if (this.deviceService.isDesktop && $event.button === 0 && this.api?.getGridOption('suppressRowClickSelection')) {
      if (!this.pendingChanges.check()) {
        this.api?.updateGridOptions({ suppressRowClickSelection: false, suppressCellFocus: false });
        this.selectEvent($event);
      } else {
        $event.preventDefault();
        $event.stopImmediatePropagation();
      }
    }
  }

  private selectEvent($event: MouseEvent | any) {
    const colId = $event.composedPath?.().find((el) => el?.getAttribute('col-id'))?.getAttribute('col-id');
    const rowId = $event.composedPath?.().find((el) => el?.getAttribute('row-id'))?.getAttribute('row-id');
    if (colId) {
      this.selectRows([rowId], colId, false);
      this.onSelectionChanged(null);
    }
  }

  @HostListener('ngxResize', ['$event'])
  onResized(e: NgxResizeResult) {
    this.resizeSource.next(e);
  }

  isReady() {
    return !!(this.gridOptions && this.api);
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.pluginsService.unregister(this);
  }
}
