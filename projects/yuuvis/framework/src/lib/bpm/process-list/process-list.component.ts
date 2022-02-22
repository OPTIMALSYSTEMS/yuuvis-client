import { RowNode } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TaskRow } from '@yuuvis/core';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { ResponsiveDataTableComponent, ViewMode } from './../../components/responsive-data-table/responsive-data-table.component';

interface HeaderDetails {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'yuv-process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.scss']
})
export class ProcessListComponent {
  private _dataTable: ResponsiveDataTableComponent;
  @ViewChild('dataTable')
  set dataTable(data: ResponsiveDataTableComponent) {
    setTimeout(() => {
      if (this.processData.rows[0] instanceof TaskRow) {
        data.selectRows();
      }
    }, 1500);
    this._dataTable = data;
  }

  get dataTable() {
    return this._dataTable;
  }
  private _processData: any;
  private _viewMode: ViewMode = 'horizontal';
  header: HeaderDetails;
  totalNumItems: number;

  @Input() layoutOptionsKey: string;
  @Input()
  set processData(data: ResponsiveTableData) {
    let rowsToBeSelected: RowNode[] = [];
    if (this.dataTable) {
      rowsToBeSelected = this.dataTable.gridOptions.api.getSelectedNodes();
    }

    this._processData = data;
    this.totalNumItems = data ? data.rows.length : 0;

    if (this.dataTable && rowsToBeSelected.length) {
      let index = rowsToBeSelected[0].rowIndex;
      if (index >= data.rows.length) index = data.rows.length - 1;
      setTimeout(() => {
        this.dataTable.gridOptions.api.selectIndex(index, false, false);
      }, 50);
    }
  }
  get processData() {
    return this._processData;
  }

  @Input()
  set headerDetails({ title, description, icon }: HeaderDetails) {
    this.header = { title, description, icon };
  }

  @Input()
  set viewMode(mode: ViewMode) {
    this._viewMode = mode;
  }
  get viewMode(): ViewMode {
    return this._viewMode;
  }
  showStatusFilter: boolean;

  @Input() showFooter = true;
  @Input() statusFilter: 'all' | 'running' | 'completed' = 'all';

  @Output() selectedItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshList: EventEmitter<any> = new EventEmitter<any>();
  @Output() statusFilterChange: EventEmitter<'all' | 'running' | 'completed'> = new EventEmitter<'all' | 'running' | 'completed'>();

  constructor() {}

  setStatusFilter(statusFilter: 'all' | 'running' | 'completed') {
    this.statusFilter = statusFilter;
    this.statusFilterChange.emit(this.statusFilter);
  }

  select(event) {
    this.selectedItem.emit(event);
  }

  refresh() {
    this.refreshList.emit();
  }

  ngOnInit() {
    this.showStatusFilter = this.statusFilterChange.observers && this.statusFilterChange.observers.length > 0;
  }
}
