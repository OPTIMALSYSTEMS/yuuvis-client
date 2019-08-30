import { Component, OnInit } from '@angular/core';
import { SearchQuery } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-search-result',
  templateUrl: './test-search-result.component.html',
  styleUrls: ['./test-search-result.component.scss']
})
export class TestSearchResultComponent implements OnInit {
  query: SearchQuery;

  constructor() {}

  setQuery() {
    this.query = new SearchQuery({
      term: '*'
    });
  }

  ngOnInit() {}
}
