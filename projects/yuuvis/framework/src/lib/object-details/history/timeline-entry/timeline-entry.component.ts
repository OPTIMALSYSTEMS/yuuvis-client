import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { DmsObjectHistoryEntry } from '../object-history/model/dms-object-history.model';

@Component({
  selector: 'yuv-timeline-entry',
  templateUrl: './timeline-entry.component.html',
  styleUrls: ['./timeline-entry.component.scss']
})
export class TimelineEntryComponent {
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

  trackByIndex(index, item) {
    return index;
  }
}
