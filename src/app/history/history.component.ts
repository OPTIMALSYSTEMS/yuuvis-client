import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IVisibleFilter } from '../objectHistory/interface/history-filter.interface';
import { DmsObjectHistoryEntry } from '../objectHistory/model/dms-object-history.model';
import { ObjectHistoryService } from '../objectHistory/service/object-history.service';

@Component({
  selector: 'yuv-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  _params: any; //DmsParams;
  _history: Observable<DmsObjectHistoryEntry[]>; //: DmsObjectHistoryEntry[] = [];
  filters: string[] = [];
  filterterm: string;
  visibleFilter: IVisibleFilter = { select: true, input: true };

  @Input()
  set objectId(id) {
    this.history = this.historyService.objectHistory(id);
  }
  set history(history: Observable<DmsObjectHistoryEntry[]>) {
    this._history = history;
  }
  get history(): Observable<DmsObjectHistoryEntry[]> {
    return this._history;
  }

  constructor(private historyService: ObjectHistoryService) {}

  ngOnInit() {}

  toggleFilter(filters) {
    const [type, hasFilter] = filters;
    if (hasFilter) {
      this.filters = this.filters.filter(s => s !== type);
    } else {
      this.filters.push(type);
    }
    // todo: ChangeDetection should not work here, Hä?
    this.history = this._history.pipe(
      map((entrys: DmsObjectHistoryEntry[]) =>
        entrys.filter(entry => this.filters.indexOf(entry.group) === -1)
      )
    );
  }

  trackByIndex(index, item) {
    return index;
  }
}
