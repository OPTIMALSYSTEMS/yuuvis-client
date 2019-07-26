import { Component, OnInit } from '@angular/core';
import { IVisibleFilter } from '../history-filter/history-filter.component';

@Component({
  selector: 'yuv-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  _params: any; //DmsParams;
  _history = []; //: DmsObjectHistoryEntry[] = [];
  history = []; //: DmsObjectHistoryEntry[] = [];
  filters: string[] = [];
  filterterm: string;
  visibleFilter: IVisibleFilter = { select: true, input: true };

  constructor() {}

  ngOnInit() {}

  toggleFilter(filter) {
    const [type, hasFilter] = filter;
    if (hasFilter) {
      this.filters = this.filters.filter(s => s !== type);
    } else {
      this.filters.push(type);
    }
    // todo: ChangeDetection should not work here, Hä?
    this.history = this._history.filter(
      entry => this.filters.indexOf(entry.group) === -1
    );
  }

  trackByIndex(index, item) {
    return index;
  }
}
