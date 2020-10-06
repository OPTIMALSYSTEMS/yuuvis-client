import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { InboxItem } from '@yuuvis/core';
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
  @ViewChild('dataTable')
  set dataTable(data: ResponsiveDataTableComponent) {
    setTimeout(() => {
      if (this.processData.rows[0] instanceof InboxItem) {
        data.selectRows();
      }
    }, 1500);
  }
  private _processData: any;
  private _viewMode: ViewMode;
  header: HeaderDetails;

  @Input() layoutOptionsKey: string;
  @Input()
  set processData(data) {
    console.log(data);

    this._processData = data;
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

  @Input() showFooter = true;

  @Output() selectedItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshList: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  select(event) {
    this.selectedItem.emit(event);
  }

  refresh() {
    this.refreshList.emit();
  }
}
