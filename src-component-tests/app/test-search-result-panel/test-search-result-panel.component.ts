import { Component, OnInit } from '@angular/core';
import { SearchQuery } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-search-result-panel',
  templateUrl: './test-search-result-panel.component.html',
  styleUrls: ['./test-search-result-panel.component.scss']
})
export class TestSearchResultPanelComponent implements OnInit {
  query: SearchQuery;
  constructor() {}

  setQuery() {
    this.query = new SearchQuery({
      term: '*',
      types: ['email:email']
    });
  }

  onItemsSelected(e) {
    console.log(e);
  }

  ngOnInit() {}
}
