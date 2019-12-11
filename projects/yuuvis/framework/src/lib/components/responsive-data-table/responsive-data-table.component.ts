import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridOptions, Module, RowEvent, RowNode } from '@ag-grid-community/core';
import { Component, EventEmitter, HostBinding, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BaseObjectTypeField, DeviceService, PendingChangesService, Utils } from '@yuuvis/core';
import { ResizedEvent } from 'angular-resize-event';
import { Observable, ReplaySubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { ColumnSizes } from '../../services/grid/grid.interface';
import { RecentAcitivitiesItemComponent } from './../recent-activities/recent-acitivities-item/recent-acitivities-item.component';
import { ResponsiveTableData } from './responsive-data-table.interface';

export type ViewMode = 'standard' | 'horizontal' | 'grid' | 'auto';

/**
 * Responsive DataTable
 */
@Component({
  selector: 'yuv-responsive-data-table',
  templateUrl: './responsive-data-table.component.html',
  styleUrls: ['./responsive-data-table.component.scss']
})
export class ResponsiveDataTableComponent implements OnInit, OnDestroy {
  // internal subject for element size changes used for debouncing resize events
  private resizeSource = new ReplaySubject<ResizedEvent>();
  public resize$: Observable<ResizedEvent> = this.resizeSource.asObservable();
  // internal subject column size changes used for debouncing column resize events
  private columnResizeSource = new ReplaySubject<any>();
  public columnResize$: Observable<ResizedEvent> = this.columnResizeSource.asObservable();
  private _data: ResponsiveTableData;
  // array of row IDs that are currently selected
  private _currentSelection: string[] = [];

  private settings = {
    headerHeight: { standard: 37, horizontal: 0, grid: 0 },
    rowHeight: { standard: 48, horizontal: 70, grid: 160 },
    colWidth: { standard: 'auto', horizontal: 'auto', grid: 160 },
    size: { newHeight: 0, newWidth: 0 }
  };

  gridOptions: GridOptions;

  public modules: Module[] = [ClientSideRowModelModule];

  @Input() options: any;
  /**
   * Emitted when column sizes have been changed.
   */
  @Output() optionsChanged = new EventEmitter();
  @Output() rowDoubleClicked = new EventEmitter<RowEvent>();

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
   * view mode of the table
   */
  @Input() set viewMode(viewMode: ViewMode) {
    this._viewMode = viewMode || 'auto';
    this.currentViewMode = this._viewMode;
  }

  get viewMode() {
    return this._viewMode;
  }

  set currentViewMode(viewMode: ViewMode) {
    viewMode = this.viewMode === 'auto' ? this._autoViewMode : this.viewMode;
    if (this.currentViewMode !== viewMode) {
      this._currentViewMode = viewMode;
      this.applyGridOption();
    }
  }

  get currentViewMode() {
    return this._currentViewMode;
  }

  private _viewMode: ViewMode = 'auto';
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

  @HostBinding('class.yuv-responsive-data-table') _hostClass = true;

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
    return this.currentViewMode === 'grid' && this.settings.size.newHeight < this.settings.rowHeight.grid;
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

  constructor(private pendingChanges: PendingChangesService, private deviceService: DeviceService) {
    // subscribe to the whole components size changing
    this.resize$
      .pipe(
        takeUntilDestroy(this)
        // debounceTime(500)
      )
      .subscribe(({ newHeight, newWidth }: ResizedEvent) => {
        this.settings.size = { newHeight, newWidth };
        this._autoViewMode = newHeight < this.breakpoint ? 'grid' : newWidth < this.breakpoint ? 'horizontal' : 'standard';
        this.currentViewMode = this._autoViewMode;
      });
    // subscribe to columns beeing resized
    this.columnResize$.pipe(takeUntilDestroy(this), debounceTime(1000)).subscribe((e: ResizedEvent) => {
      if (this.isStandard) {
        this.columnResized.emit({
          columns: this.gridOptions.columnApi.getColumnState().map(columnState => ({
            id: columnState.colId,
            width: columnState.width
          }))
        });
        this.optionsChanged.emit(Utils.arrayToObject(this.gridOptions.columnApi.getColumnState(), 'colId', 'width'));
      }
    });

    // subscribe to pending hanges
    this.pendingChanges.tasks$.pipe(takeUntilDestroy(this)).subscribe(tasks => this.gridOptions && (this.gridOptions.suppressCellSelection = !!tasks.length));
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
    const matchRow = this._data.rows.find(r => r.id === id);
    if (matchRow) {
      Object.keys(matchRow).forEach(k => {
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

  private applyGridOption() {
    if (this.gridOptions && this.gridOptions.api) {
      this.gridOptions.api.setRowData(this._data.rows);
      this.gridOptions.api.setHeaderHeight(this.settings.headerHeight[this.currentViewMode]);

      const columns = this.isSmall ? [this.getSmallSizeColDef()] : this._data.columns;
      if (JSON.stringify(this.gridOptions.columnDefs) !== JSON.stringify(columns)) {
        this.gridOptions.columnDefs = columns;
        this.gridOptions.api.setColumnDefs(columns);
      }

      if (this._data.sortModel) {
        this.gridOptions.api.setSortModel([...this._data.sortModel]);
      }

      if (this.isSmall) {
        // gridOptions to be applied for the small view
        this.gridOptions.columnApi.autoSizeAllColumns();
        this.gridOptions.api.sizeColumnsToFit();
      }

      // make sure that all rows are visible / loaded
      this.gridOptions.rowBuffer = this.isSmall ? 1000 : undefined;
      // if the small state changed, a different set of rowData is applied to the grid
      // so we need to reselect the items that were selected before
      this.selectRows(this._currentSelection);
    }
  }

  private getSmallSizeColDef(): ColDef {
    const colDef: ColDef = {
      field: BaseObjectTypeField.OBJECT_ID,
      cellClass: 'cell-title-description',
      minWidth: this.isGrid ? this._data.rows.length * this.settings.colWidth.grid : 0,
      cellRendererFramework: RecentAcitivitiesItemComponent
      // cellRenderer: params => `
      //     <div class="title">${params.data[this._data.titleField] || params.value || ''}</div>
      //     <div class="description">${params.data[this._data.descriptionField] || ''}</div>
      //   `
    };
    return colDef;
  }

  /**
   * select rows based on list of IDs
   * @param selection default is first row
   */
  selectRows(selection?: string[], focusColId?: string) {
    this.gridOptions.api.clearFocusedCell();
    this.gridOptions.api.deselectAll();
    (selection || [this._data.rows[0].id]).forEach((id: string, index: number) => {
      const n = this.gridOptions.api.getRowNode(id);
      if (n) {
        if (index === 0) {
          this.gridOptions.api.setFocusedCell(n.rowIndex, focusColId || this._data.columns[0].field);
          this.gridOptions.api.ensureIndexVisible(n.rowIndex);
        }
        n.setSelected(true, index === 0);
      }
    });
  }

  private setupGridOptions() {
    this.gridOptions = {
      getRowNodeId: data => {
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

      // EVENTS - add event callback handlers
      onSelectionChanged: event => {
        const selection = this.gridOptions.api.getSelectedNodes().map((rowNode: RowNode) => rowNode.id);
        if (!event || JSON.stringify(selection) !== JSON.stringify(this._currentSelection)) {
          this._currentSelection = selection;
          this.selectionChanged.emit(this.gridOptions.api.getSelectedRows());
        }
      },
      onColumnResized: event => {
        this.columnResizeSource.next();
      },
      onSortChanged: event => {
        this.sortChanged.emit(this.gridOptions.api.getSortModel());
      },
      onGridReady: event => {
        this.gridOptions.api.setSortModel(this._data.sortModel || []);
        this.gridOptions.api.setFocusedCell(0, this._data.columns[0].field);
      },
      onRowDoubleClicked: event => this.rowDoubleClicked.emit(event)
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
    if ($event.button === 0 && this.gridOptions && this.gridOptions.suppressCellSelection) {
      if (!this.pendingChanges.check()) {
        this.gridOptions.suppressCellSelection = false;
        this.selectEvent($event);
      } else {
        $event.preventDefault();
        $event.stopImmediatePropagation();
      }
    } else if (this.deviceService.isMobile || this.deviceService.isTablet) {
      // ag-grid issue with selection on mobile devices
      this.selectEvent($event);
    }
  }

  private selectEvent($event: MouseEvent | any) {
    const colEl = ($event.composedPath ? $event.composedPath() : []).find(el => el.getAttribute('col-id'));
    if (colEl) {
      this.selectRows([colEl.parentElement.getAttribute('row-id')], colEl.getAttribute('col-id'));
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
  ngOnInit() {}

  ngOnDestroy() {}
}
