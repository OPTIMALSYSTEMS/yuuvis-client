import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-inbox-list',
  templateUrl: './inbox-list.component.html',
  styleUrls: ['./inbox-list.component.scss']
})
export class InboxListComponent implements OnInit {
  layoutOptionsKey = 'yuv.app.inbox';
  private _inboxData: any;
  @Input()
  set inboxData(data) {
    console.log({ data });

    this._inboxData = data;
  }
  get tableData() {
    return this._inboxData;
  }

  constructor() {}

  ngOnInit() {}

  onSelectionChanged(item) {
    console.log({ item });
  }
}
