import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ViewMode } from './../../components/responsive-data-table/responsive-data-table.component';

@Component({
  selector: 'yuv-inbox-list',
  templateUrl: './inbox-list.component.html',
  styleUrls: ['./inbox-list.component.scss']
})
export class InboxListComponent implements OnInit {
  layoutOptionsKey = 'yuv.app.inbox';
  private _inboxData: any;
  viewMode: ViewMode;

  @Input()
  set inboxData(data) {
    console.log({ data });

    this._inboxData = data;
  }
  get inboxData() {
    return this._inboxData;
  }

  @Output() selectedItem: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

  select(event) {
    this.selectedItem.emit(event);
  }

  refresh() {}
}
