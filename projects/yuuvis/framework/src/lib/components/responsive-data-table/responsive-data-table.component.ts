import { Component, EventEmitter, HostBinding, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BaseObjectTypeField, Utils } from '@yuuvis/core';
import { ColDef, GridOptions, RowEvent, RowNode } from 'ag-grid-community';
import { ResizedEvent } from 'angular-resize-event';
import { Observable, ReplaySubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { ColumnSizes } from '../../services/grid/grid.interface';
import { ResponsiveTableData } from './responsive-data-table.interface';

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
    headerHeight: { default: 37, small: 0 },
    rowHeight: { default: 48, small: 70 }
  };

  gridOptions: GridOptions;

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
    66;
    this._data = data;
    if (this.gridOptions) {
      this.applyGridOption(this.small);
    } else {
      this.setupGridOptions();
    }
  }
  /**
   * width (number in pixel) of the table below which it should switch to small view
   */
  @Input() breakpoint = 600;

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
  @HostBinding('class.small') small = false;
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

  constructor() {
    // subscribe to the whole components size changing
    this.resize$
      .pipe(
        takeUntilDestroy(this)
        // debounceTime(500)
      )
      .subscribe((e: ResizedEvent) => {
        const small = e.newWidth < this.breakpoint;

        if (this.gridOptions && this.gridOptions.api && this.small !== small) {
          this.small = small;
          this.applyGridOption(small);
        }
      });
    // subscribe to columns beeing resized
    this.columnResize$
      .pipe(
        takeUntilDestroy(this),
        debounceTime(1000)
      )
      .subscribe((e: ResizedEvent) => {
        if (!this.small) {
          this.columnResized.emit({
            columns: this.gridOptions.columnApi.getColumnState().map(columnState => ({
              id: columnState.colId,
              width: columnState.width
            }))
          });
          this.optionsChanged.emit(Utils.arrayToObject(this.gridOptions.columnApi.getColumnState(), 'colId', 'width'));
        }
      });
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

  private applyGridOption(small?: boolean) {
    this.gridOptions.api.setRowData(this._data.rows);
    this.gridOptions.api.setHeaderHeight(small ? this.settings.headerHeight.small : this.settings.headerHeight.default);

    const columns = small ? [this.getSmallSizeColDef()] : this._data.columns;
    if (JSON.stringify(this.gridOptions.columnDefs) !== JSON.stringify(columns)) {
      this.gridOptions.columnDefs = columns;
      this.gridOptions.api.setColumnDefs(columns);
    }

    if (this._data.sortModel) {
      this.gridOptions.api.setSortModel([...this._data.sortModel]);
    }

    if (small) {
      // gridOptions to be applied for the small view
      this.gridOptions.columnApi.autoSizeAllColumns();
      this.gridOptions.api.sizeColumnsToFit();
    }
    // if the small state changed, a different set of rowData is applied to the grid
    // so we need to reselect the items that were selected before
    this.selectRows(this._currentSelection);
  }

  private getSmallSizeColDef(): ColDef {
    const colDef: ColDef = {
      field: BaseObjectTypeField.OBJECT_ID
    };
    colDef.cellClass = 'cell-title-description';

    colDef.cellRenderer = params => {
      return `
        <div class="title">${params.data[this._data.titleField] || params.value || ''}</div>
        <div class="description">${params.data[this._data.descriptionField] || ''}</div>
      `;
    };
    return colDef;
  }

  /**
   * select rows based on list of IDs
   * @param selection default is first row
   */
  selectRows(selection?: string[]) {
    (selection || [this._data.rows[0].id]).forEach((id: string) => {
      const n = this.gridOptions.api.getRowNode(id);
      if (n) {
        n.setSelected(true);
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
        return this.small ? this.settings.rowHeight.small : this.settings.rowHeight.default;
      },
      rowData: this._data.rows,
      columnDefs: this._data.columns,
      headerHeight: this.settings.headerHeight.default,
      rowHeight: this.settings.rowHeight.default,
      suppressCellSelection: false,
      rowSelection: this._data.selectType || 'single',
      rowDeselection: true,
      suppressNoRowsOverlay: true,

      // EVENTS - add event callback handlers
      onSelectionChanged: event => {
        const selection = this.gridOptions.api.getSelectedNodes().map((rowNode: RowNode) => rowNode.id);
        if (JSON.stringify(selection) !== JSON.stringify(this._currentSelection)) {
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
      }
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
