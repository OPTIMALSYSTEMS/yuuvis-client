import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DmsObjectHistoryEntry } from '../objectHistory/model/dms-object-history.model';

@Component({
  selector: 'yuv-timeline-entry',
  templateUrl: './timeline-entry.component.html',
  styleUrls: ['./timeline-entry.component.scss']
})
export class TimelineEntryComponent implements OnInit {
  private _history: Observable<DmsObjectHistoryEntry[]>;

  @Input() filters: any;
  @Input() filterterm: any;

  @Input()
  set history(history: Observable<DmsObjectHistoryEntry[]>) {
    this._history = history;
  }

  get history(): Observable<DmsObjectHistoryEntry[]> {
    return this._history;
  }

  constructor() {}

  ngOnInit() {}

  trackByIndex(index, item) {
    return index;
  }
}
