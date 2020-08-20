import { Component, OnInit } from '@angular/core';
import { SearchQuery } from '@yuuvis/core';

@Component({
  selector: 'yuv-filter-configuration',
  templateUrl: './filter-configuration.component.html',
  styleUrls: ['./filter-configuration.component.scss']
})
export class FilterConfigurationComponent implements OnInit {
  data: any = {
    query: new SearchQuery(),
    typeSelection: [],
    sharedFields: false
  };

  constructor() {}

  ngOnInit(): void {}
}
