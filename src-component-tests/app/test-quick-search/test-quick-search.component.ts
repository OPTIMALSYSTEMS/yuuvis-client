import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchQuery } from '@yuuvis/core';
import { ObjectTypeAggregation, QuickSearchComponent } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-quick-search',
  templateUrl: './test-quick-search.component.html',
  styleUrls: ['./test-quick-search.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestQuickSearchComponent implements OnInit {
  @ViewChild('quickSearch', { static: true }) quickSearchEl: QuickSearchComponent;
  storedQuery = {
    size: 50,
    term: 'bart*',
    types: ['tenKolibri:qadocallsinglefields'],
    filters: { 'system:contentStreamLength': { o: 'eq', v1: 300 }, 'system:contentStreamFileName': { o: 'eq', v1: 'datei*' } }
  };
  query: SearchQuery;
  aggs: ObjectTypeAggregation[];

  constructor() {}

  setQuery(q) {
    this.query = new SearchQuery(q ? q : {});
  }

  onSubmit(evt) {
    console.log(evt);
  }

  onTypeAggregation(aggs: ObjectTypeAggregation[]) {
    this.aggs = aggs;
  }

  applyAggregation(agg: ObjectTypeAggregation) {
    this.quickSearchEl.applyTypeAggration(agg, true);
  }

  ngOnInit() {}
}
