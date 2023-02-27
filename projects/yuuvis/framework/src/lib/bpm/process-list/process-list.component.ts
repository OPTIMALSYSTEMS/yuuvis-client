import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ConfigService } from '@yuuvis/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { YuvGridOptions } from '../../shared/utils/utils';
import { clear, listModeDefault, listModeSimple, refresh } from '../../svg.generated';
import { ResponsiveDataTableComponent } from './../../components/responsive-data-table/responsive-data-table.component';

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
export class ProcessListComponent  extends YuvGridOptions {
  @ViewChild('dataTable') dataTable: ResponsiveDataTableComponent;
  private _processData: any;
  header: HeaderDetails;
  totalNumItems: number;

  @Input() layoutOptionsKey: string;
  @Input()
  set processData(data: ResponsiveTableData) {
    this._processData = data;
    this.totalNumItems = data ? data.rows?.length : 0;
  }
  get processData() {
    return this._processData;
  }

  @Input()
  set headerDetails({ title, description, icon }: HeaderDetails) {
    this.header = { title, description, icon };
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

  constructor(private iconRegistry: IconRegistryService, public config: ConfigService) {
    super(config);
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
