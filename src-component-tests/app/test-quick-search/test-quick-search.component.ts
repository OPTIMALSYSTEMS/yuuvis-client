import { Component, OnInit } from '@angular/core';
import { SearchQuery } from './../../../projects/yuuvis/core/src/lib/service/search/search-query.model';

@Component({
  selector: 'yuv-test-quick-search',
  templateUrl: './test-quick-search.component.html',
  styleUrls: ['./test-quick-search.component.scss']
})
export class TestQuickSearchComponent implements OnInit {
  private storedQuery = {
    size: 50,
    term: 'bart*',
    types: ['tenKolibri:qadocallsinglefields'],
    filters: { 'system:contentStreamLength': { o: 'eq', v1: 300 }, 'system:contentStreamFileName': { o: 'eq', v1: 'datei*' } }
  };
  query: SearchQuery;

  constructor() {}

  setQuery(q) {
    this.query = new SearchQuery(q ? q : {});
  }

  ngOnInit() {}
}
