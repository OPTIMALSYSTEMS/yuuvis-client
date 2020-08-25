import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewMode } from '../../components';

@Component({
  selector: 'yuv-inbox-list',
  templateUrl: './inbox-list.component.html',
  styleUrls: ['./inbox-list.component.scss']
})
export class InboxListComponent {
  layoutOptionsKey = 'yuv.app.inbox';
  private _inboxData: any;
  viewMode: ViewMode;

  @Input()
  set inboxData(data) {
    data.currentViewMode = 'standart';
    this._inboxData = data;
  }
  get inboxData() {
    return this._inboxData;
  }

  @Output() selectedItem: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  select(event) {
    this.selectedItem.emit(event);
  }

  refresh() {}
}
