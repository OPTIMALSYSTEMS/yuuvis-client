import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewMode } from '../../components';

@Component({
  selector: 'yuv-processes-list',
  templateUrl: './processes-list.component.html',
  styleUrls: ['./processes-list.component.scss']
})
export class ProcessesListComponent {
  layoutOptionsKey = 'yuv.app.processes';
  private _processesData: any;
  viewMode: ViewMode;

  @Input()
  set processesData(data) {
    data.currentViewMode = 'standart';
    this._processesData = data;
  }
  get processesData() {
    return this._processesData;
  }

  @Output() selectedItem: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  select(event) {
    this.selectedItem.emit(event);
  }

  refresh() {}
}
