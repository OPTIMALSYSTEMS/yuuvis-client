import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface IHistoryFilter {
  type: string;
  hasFilter?: boolean;
}

export interface IVisibleFilter {
  select: boolean;
  input: boolean;
}

@Component({
  selector: 'yuv-history-filter',
  templateUrl: './history-filter.component.html',
  styleUrls: ['./history-filter.component.scss']
})
export class HistoryFilterComponent {
  filterterm: string;

  SvgIcons = {
    filter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0zm0 0h24v24H0V0z"/><path d="M17.01 14h-.8l-.27-.27c.98-1.14 1.57-2.61 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5s-6.5 3-6.5 6.5H2l3.84 4 4.16-4H6.51C6.51 7 8.53 5 11.01 5s4.5 2.01 4.5 4.5c0 2.48-2.02 4.5-4.5 4.5-.65 0-1.26-.14-1.82-.38L7.71 15.1c.97.57 2.09.9 3.3.9 1.61 0 3.08-.59 4.22-1.57l.27.27v.79l5.01 4.99L22 19l-4.99-5z"/></svg>',
    clear: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
  }



  @Input() visibleFilter: IVisibleFilter = { select: true, input: true };
  @Input() filters: any;
  @Output() onToggleFilter: EventEmitter<any> = new EventEmitter<any>();

  @Input() history: any;
  @Output() termChange = new EventEmitter<any>();

  @Input()
  get term() {
    return this.filterterm;
  }

  set term(val) {
    this.filterterm = val;
    this.termChange.emit(this.filterterm);
  }

  typeinput(event) {
    this.term = event.target.value;
  }

  resetFilter() {
    this.filterterm = null;
    this.term = null;
  }

  hasFilter(filter: string) {
    return this.filters.indexOf(filter) !== -1;
  }

  toggleFilter(type) {
    const filter = this.hasFilter(type);
    this.onToggleFilter.emit([type, filter]);
  }
}
