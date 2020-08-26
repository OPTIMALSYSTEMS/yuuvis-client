import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewMode } from '../../components/responsive-data-table/responsive-data-table.component';

@Component({
  selector: 'yuv-process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.scss']
})
export class ProcessListComponent {
  layoutOptionsKey = 'yuv.app.process';
  private _processData: any;
  viewMode: ViewMode;

  @Input()
  set processData(data) {
    data.currentViewMode = 'standart';
    this._processData = data;
  }
  get processData() {
    return this._processData;
  }

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
