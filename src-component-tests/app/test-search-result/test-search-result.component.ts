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

  teamsQuery() {
    this.query = new SearchQuery({
      size: 50,
      types: ['appTeams:toteamsdoc'],
      filters: {
        'appTeams:toteam': {
          op: 'eq',
          v1: 'yuuvis'
        }
      },
      // filters: [
      //   { property: 'appTeams:toteam', operator: 'eq', firstValue: 'yuuvis' },
      //   { property: 'appTeams:tochannel', operator: 'eq', firstValue: 'general' }
      // ],
      // sortOptions: [],
      fields: []
    });
  }

  setSingleTypeQuery() {
    this.query = new SearchQuery({
      types: ['appPersonalfile:pfpersonalfile']
    });
  }

  clearQuery() {
    this.query = null;
  }
  ngOnInit() {}
}
