import { RowNode } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { clear, listModeDefault, listModeSimple, refresh } from '../../svg.generated';
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
  @ViewChild('dataTable') dataTable: ResponsiveDataTableComponent;
  private _processData: any;
  private _viewMode: ViewMode = 'horizontal';
  header: HeaderDetails;
  totalNumItems: number;

  @Input() layoutOptionsKey: string;
  @Input()
  set processData(data: ResponsiveTableData) {
    this._processData = data;
    this.totalNumItems = data ? data.rows?.length : 0;

    let rowsToBeSelected: RowNode[] = this.dataTable?.gridOptions.api?.getSelectedNodes();
    if (rowsToBeSelected?.length) {
      // try to find index by ID first
      const rowNode = this.dataTable.gridOptions.api.getRowNode(rowsToBeSelected[0].data.id);
      let index = rowNode ? rowNode.rowIndex : rowsToBeSelected[0].rowIndex;
      if (index >= data.rows.length) index = data.rows.length - 1;
      setTimeout(() => {
        this.dataTable.gridOptions.api?.selectIndex(index, false, false);
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
  set viewMode(viewMode: ViewMode) {
    if (this.dataTable) {
      this.dataTable.viewMode = this.dataTable.viewMode !== viewMode ? viewMode : 'auto';
    }
  }
  get viewMode(): ViewMode {
    return this.dataTable ? this.dataTable.viewMode : null;
  }

  @Input() showFooter = true;
  @Input() statusFilter: 'all' | 'running' | 'completed' = 'all';
  @Input() set filterTerm(t: string) {
    if (t && this.appliedTermFilter !== t) {
      this.termFilterForm.patchValue({ term: t });
      this.filterByTerm();
    }
  }

  @Output() selectedItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshList: EventEmitter<any> = new EventEmitter<any>();
  @Output() statusFilterChange: EventEmitter<'all' | 'running' | 'completed'> = new EventEmitter<'all' | 'running' | 'completed'>();
  @Output() termFilterChange: EventEmitter<string> = new EventEmitter<string>();

  termFilterForm: UntypedFormGroup = new UntypedFormGroup({
    term: new UntypedFormControl('')
  });
  appliedTermFilter: string;

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([listModeDefault, listModeSimple, refresh, clear]);
  }

  setStatusFilter(statusFilter: 'all' | 'running' | 'completed') {
    this.statusFilter = statusFilter;
    this.statusFilterChange.emit(this.statusFilter);
  }

  filterByTerm() {
    this.appliedTermFilter = this.termFilterForm.value.term;
    this.termFilterChange.emit(this.appliedTermFilter);
  }

  resetTermFilter() {
    this.appliedTermFilter = null;
    this.termFilterForm.patchValue({ term: null });
    this.termFilterChange.emit(null);
  }

  select(event) {
    this.selectedItem.emit(event);
  }

  refresh() {
    this.refreshList.emit();
  }

  ngOnInit() {}
}
