import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { GridOptions, RowNode } from 'ag-grid-community';
import { ResizedEvent } from 'angular-resize-event';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ResponsiveTableData } from './responsive-data-table.interface';

@Component({
  selector: 'yuv-responsive-data-table',
  templateUrl: './responsive-data-table.component.html',
  styleUrls: ['./responsive-data-table.component.scss'],
  host: { class: 'yuv-responsive-data-table' }
})
export class ResponsiveDataTableComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private resizeSource = new ReplaySubject<ResizedEvent>();
  public resize$: Observable<ResizedEvent> = this.resizeSource.asObservable();
  private _data: ResponsiveTableData;
  // array of row IDs that are currently selected
  private _currentSelection: string[] = [];

  private settings = {
    headerHeight: { default: 30, small: 0 },
    rowHeight: { default: 48, small: 70 }
  };

  _gridOptions: GridOptions;

  @HostBinding('class.small') small: boolean = false;
  @HostListener('keydown.control.c', ['$event']) copyCellHandler(
    event: KeyboardEvent
  ) {
    // copy cell
    this.copyToClipboard('cell');
  }
  @HostListener('keydown.control.shift.c', ['$event']) copyRowHandler(
    event: KeyboardEvent
  ) {
    // copy row
    this.copyToClipboard('row');
  }

  @Input() set data(data: ResponsiveTableData) {
    if (this._gridOptions) {
      // already got a grid running
      this._gridOptions.api.setRowData(data.rows);

      if (JSON.stringify(this._data.columns) !== JSON.stringify(data.columns)) {
        this._gridOptions.api.setColumnDefs(data.columns);
      }
      this._data = data;
    } else {
      this._data = data;
      this.setupGridOptions();
    }
  }
  // width (number in pixel) of the table below which it should switch to small view
  @Input() breakpoint: number = 600;

  // emits an array of the selected rows
  @Output() selectionChanged = new EventEmitter<any[]>();

  constructor() {
    this.subscriptions.push(
      this.resize$.pipe(debounceTime(500)).subscribe((e: ResizedEvent) => {
        const small = e.newWidth < this.breakpoint;

        if (
          this._gridOptions &&
          this._gridOptions.api &&
          this.small !== small
        ) {
          this.small = small;
          this.applyGridOption(small);
          this._gridOptions.api.sizeColumnsToFit();
        }
      })
    );
  }

  private applyGridOption(small?: boolean) {
    if (small) {
      // gridOptions to be applied for the small view
      this._gridOptions.api.setHeaderHeight(this.settings.headerHeight.small);
      this._gridOptions.api.setColumnDefs([{ field: 'title' }]);
      this._gridOptions.api.setRowData(
        this._data.rows.map(r => ({
          id: r.id,
          title: `${r[this._data.titleField]} --- ${
            r[this._data.descriptionField]
          }`
        }))
      );
    } else {
      // gridOptions to be applied for the regular view
      this._gridOptions.api.setHeaderHeight(this.settings.headerHeight.default);
      this._gridOptions.api.setColumnDefs(this._data.columns);
      this._gridOptions.api.setRowData(this._data.rows);
    }
    // if the small state changed, a different set of rowData is applied to the grid
    // so we need to reselect the items that were selected before
    if (this._currentSelection.length) {
      this._currentSelection.forEach((id: string) => {
        const n = this._gridOptions.api.getRowNode(id);
        n.setSelected(true);
      });
    }
  }

  private setupGridOptions() {
    this._gridOptions = {
      getRowNodeId: data => {
        // defines what to use as ID for each row (important for reselecting a previous selection)
        return data.id;
      },
      getRowHeight: () => {
        return this.small
          ? this.settings.rowHeight.small
          : this.settings.rowHeight.default;
      },
      rowData: this._data.rows,
      columnDefs: this._data.columns,
      headerHeight: this.settings.headerHeight.default,
      rowHeight: this.settings.rowHeight.default,
      // pagination: true,
      suppressCellSelection: false,
      rowSelection: this._data.selectType || 'single',

      // EVENTS - add event callback handlers
      // onRowClicked: function (event) { console.log('a row was clicked'); },
      // onColumnResized: function (event) { console.log('a column was resized'); },
      // onGridReady: function (event) { console.log('the grid is now ready'); },
      onSelectionChanged: event => {
        this._currentSelection = this._gridOptions.api
          .getSelectedNodes()
          .map((rowNode: RowNode) => rowNode.id);
        this.selectionChanged.emit(this._gridOptions.api.getSelectedRows());
      }
    };
  }

  // copy content of either row or table cell to clipboard
  private copyToClipboard(type: 'row' | 'cell') {
    let content = '';
    const focusedCell = this._gridOptions.api.getFocusedCell();
    const row: RowNode = this._gridOptions.api.getDisplayedRowAtIndex(
      focusedCell.rowIndex
    );
    switch (type) {
      case 'row': {
        // TODO: define how data should be formatted in clipboard.
        const data = [];
        Object.keys(row.data).forEach(k => {
          data.push(row.data[k]);
        });
        content = data.join(',');
        break;
      }
      case 'cell': {
        content = this._gridOptions.api.getValue(focusedCell.column, row);
        break;
      }
    }

    let textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    let copySuccess = document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  onResized(e) {
    this.resizeSource.next(e);
  }
  ngOnInit() {}

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
