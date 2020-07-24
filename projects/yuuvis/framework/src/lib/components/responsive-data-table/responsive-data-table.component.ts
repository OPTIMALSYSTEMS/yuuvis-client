import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridOptions, Module, RowEvent, RowNode } from '@ag-grid-community/core';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { BaseObjectTypeField, DeviceService, PendingChangesService, SystemService, Utils } from '@yuuvis/core';
import { ResizedEvent } from 'angular-resize-event';
import { Observable, ReplaySubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { LocaleDatePipe } from '../../pipes/locale-date.pipe';
import { ColumnSizes } from '../../services/grid/grid.interface';
import { LayoutService } from '../../services/layout/layout.service';
import { ResponsiveTableData } from './responsive-data-table.interface';

/**
 * @ignore
 */
export type ViewMode = 'standard' | 'horizontal' | 'grid' | 'auto';

export interface ResponsiveDataTableOptions {
  viewMode?: ViewMode;
  // Object where the properties are the column IDs
  // and their values are the columns width.
  columnWidths?: any;
}

/**
 * Responsive DataTable.
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
  public columnResize$: Observable<ResizedEvent> = this.columnResizeSource.asObservable();
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
  @Input() set layoutOptionsKey(lok: string) {
    this._layoutOptionsKey = lok;
    this.layoutService.loadLayoutOptions(lok, 'yuv-responsive-data-table').subscribe((o: ResponsiveDataTableOptions) => {
      this._layoutOptions = o || {};
      if (this.gridOptions && this._data) {
        this.gridOptions.api.setColumnDefs(this.applyColDefOptions(this._data.columns));
        this.gridOptions.columnApi.resetColumnState();
      }
      if (o && o.viewMode) {
        this.setupViewMode(o.viewMode);
      }
    });
  }

  /**
   * ResponsiveTableData setter
   */
  @Input() set data(data: ResponsiveTableData) {
    this._data = data;
    if (this.gridOptions) {
      this.applyGridOption();
    } else {
      this.setupGridOptions();
    }
  }

  /**
   * set selected rows for the table
   */
  @Input() set selection(selection: string[]) {
    setTimeout(() => {
      this.selectRows(selection);
      this.gridOptions.onSelectionChanged(null);
    }, 100);
  }

  /**
   * view mode of the table
   */
  @Input() set viewMode(viewMode: ViewMode) {
    this.setupViewMode(viewMode);
  }

  /**
   * Limit the number of selected rows
   */
  @Input() selectionLimit;

  get viewMode() {
    return this._viewMode;
  }

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

  @HostListener('keydown.control.c', ['$event'])
  copyCellHandler(event: KeyboardEvent) {
    // copy cell
    this.copyToClipboard('cell');
  }
  @HostListener('keydown.control.shift.c', ['$event'])
  copyRowHandler(event: KeyboardEvent) {
    // copy row
    this.copyToClipboard('row');
  }

  constructor(
    private pendingChanges: PendingChangesService,
    private elRef: ElementRef,
    private datePipe: LocaleDatePipe,
    private layoutService: LayoutService,
    private systemService: SystemService,
    private deviceService: DeviceService,
    private _ngZone: NgZone
  ) {
    // subscribe to the whole components size changing
    this.resize$
      .pipe(
        takeUntilDestroy(this)
        // debounceTime(500)
      )
      .subscribe(({ newHeight, newWidth }: ResizedEvent) => {
        this.settings.size = { newHeight, newWidth };
        this._autoViewMode = newHeight < this.breakpoint ? 'grid' : newWidth < this.breakpoint ? 'horizontal' : 'standard';
        if (this.viewMode === 'auto') {
          this.currentViewMode = this._autoViewMode;
        }
      });
    // subscribe to columns beeing resized
    this.columnResize$.pipe(takeUntilDestroy(this), debounceTime(500)).subscribe((e: ResizedEvent) => {
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
    this.pendingChanges.tasks$.pipe(takeUntilDestroy(this)).subscribe((tasks) => this.gridOptions && (this.gridOptions.suppressCellSelection = !!tasks.length));
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
    const rowNode = this.gridOptions.api.getRowNode(id);
    if (rowNode) {
      this.gridOptions.api.updateRowData({ remove: [rowNode] });
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

      const columns = this.isSmall ? [this.getSmallSizeColDef()] : this._data.columns;
      if (JSON.stringify(this.gridOptions.columnDefs) !== JSON.stringify(columns)) {
        const cols = this.applyColDefOptions(columns);
        this.gridOptions.columnDefs = cols;
        this.gridOptions.api.setColumnDefs(cols);
        this.gridOptions.columnApi.resetColumnState();
      }

      if (this.isStandard && this._data.sortModel) {
        this.gridOptions.api.setSortModel([...this._data.sortModel]);
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
    } else if (retry) {
      setTimeout(() => this.applyGridOption(false), 0);
    }
  }

  private getSmallSizeColDef(): ColDef {
    const colDef: ColDef = {
      field: BaseObjectTypeField.OBJECT_ID,
      cellClass: 'cell-title-description',
      minWidth: this.isGrid ? this._data.rows.length * this.settings.colWidth.grid : 0,
      valueGetter: (params) => JSON.stringify(params.data), // needed to compare value changes & redraw cell
      cellRenderer: (params) => {
        const objectTypeId = params.data[BaseObjectTypeField.OBJECT_TYPE_ID];
        const version = params.data[BaseObjectTypeField.VERSION_NUMBER];
        const modified = this.datePipe.transform(params.data[BaseObjectTypeField.MODIFICATION_DATE]);

        const title = this.systemService.getLocalizedResource(`${objectTypeId}_label`);
        return `
          <div class="rdt-row ${this._currentViewMode === 'horizontal' ? 'row-horizontal' : 'row-grid'}" data-version="${version}">
            <div class="head" title="${title}">
            ${this.systemService.getObjectTypeIcon(objectTypeId)}</div>  
            <div class="main">
            <div class="title">${params.data[this._data.titleField] || params.data[BaseObjectTypeField.OBJECT_ID] || ''}</div>
              <div class="description">${params.data[this._data.descriptionField] || ''}</div>
              <div class="date">${modified}</div>
            </div>
          </div>
          `;
      }
    };
    return colDef;
  }

  clearSelection() {
    this.gridOptions.api.deselectAll();
  }

  /**
   * select rows based on list of IDs
   * @param selection default is first row
   */
  selectRows(selection?: string[], focusColId?: string, ensureVisibility: boolean = true) {
    this.gridOptions.api.clearFocusedCell();
    this.gridOptions.api.deselectAll();
    (selection || [this._data.rows[0].id]).forEach((id: string, index: number) => {
      const n = this.gridOptions.api.getRowNode(id);
      if (n) {
        if (index === 0) {
          this.gridOptions.api.setFocusedCell(n.rowIndex, focusColId || this._data.columns[0].field);
          if (ensureVisibility) {
            if (this.isVertical) {
              const shift = Math.floor(this.settings.size.newWidth / this.settings.colWidth.grid / 2);
              this.gridOptions.api['gridPanel'].setCenterViewportScrollLeft(Math.max(0, (n.rowIndex - shift) * this.settings.colWidth.grid));
            } else if (this.isGrid) {
              this.gridOptions.api.ensureIndexVisible(Math.floor(n.rowIndex / Math.floor(this.settings.size.newWidth / this.settings.colWidth.grid)));
            } else {
              this.gridOptions.api.ensureIndexVisible(n.rowIndex);
            }
          }
        }
        n.setSelected(true, index === 0);
      }
    });
  }

  private setupGridOptions() {
    this.gridOptions = {
      getRowNodeId: (data) => {
        // defines what to use as ID for each row (important for reselecting a previous selection)
        return data.id;
      },
      getRowHeight: () => {
        return this.settings.rowHeight[this.currentViewMode];
      },
      rowData: this._data.rows,
      columnDefs: this._data.columns,
      headerHeight: this.settings.headerHeight.standard,
      rowHeight: this.settings.rowHeight.standard,
      suppressCellSelection: false,
      rowSelection: this._data.selectType || 'single',
      rowDeselection: true,
      suppressNoRowsOverlay: true,
      multiSortKey: 'ctrl',

      onRowSelected: (e) => {
        if (this.selectionLimit) {
          const selected = e.api.getSelectedNodes();
          if (selected.length > this.selectionLimit) {
            selected[0].setSelected(false);
          }
        }
      },

      // EVENTS - add event callback handlers
      onSelectionChanged: (event) => {
        const focused = this.gridOptions.api.getFocusedCell() || { rowIndex: -1 };
        const selection = this.gridOptions.api.getSelectedNodes().sort((n) => (n.rowIndex === focused.rowIndex ? -1 : 0));
        if (!event || selection.map((rowNode: RowNode) => rowNode.id).join() !== (this._currentSelection || []).join()) {
          this._currentSelection = selection.map((rowNode: RowNode) => rowNode.id);
          // ag-grid bug on mobile - issue with change detection after touch event
          this._ngZone.run(() => this.selectionChanged.emit(selection.map((rowNode: RowNode) => rowNode.data)));
        }
      },
      onColumnResized: (event) => this.columnResizeSource.next(),
      onSortChanged: (event) => this.isStandard && this.sortChanged.emit(this.gridOptions.api.getSortModel()),
      onGridReady: (event) => {
        this.gridOptions.api.setSortModel(this._data.sortModel || []);
        this.gridOptions.api.setFocusedCell(0, this._data.columns[0].field);
      },
      onRowDoubleClicked: (event) => this.rowDoubleClicked.emit(event),
      ...(this._data && this._data.gridOptions)
    };
  }

  // copy content of either row or table cell to clipboard
  private copyToClipboard(type: 'row' | 'cell') {
    let content = '';
    const focusedCell = this.gridOptions.api.getFocusedCell();
    const row: RowNode = this.gridOptions.api.getDisplayedRowAtIndex(focusedCell.rowIndex);
    switch (type) {
      case 'row': {
        // TODO: define how data should be formatted in clipboard.
        content = Object.values(row.data).join(',');
        break;
      }
      case 'cell': {
        content = this.gridOptions.api.getValue(focusedCell.column, row);
        break;
      }
    }

    const textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    const copySuccess = document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  onMouseDown($event: MouseEvent | any) {
    // TODO: find the solution for mobile / touch event
    if (this.deviceService.isDesktop && $event.button === 0 && this.gridOptions && this.gridOptions.suppressCellSelection) {
      if (!this.pendingChanges.check()) {
        this.gridOptions.suppressCellSelection = false;
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
      this.gridOptions.onSelectionChanged(null);
      console.log(colEl.parentElement.getAttribute('row-id'));
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
