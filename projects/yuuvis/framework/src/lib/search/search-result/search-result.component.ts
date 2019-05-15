import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'yuv-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {

  @Output() itemSelected = new EventEmitter();

  constructor() { }

  select(x) {
    this.itemSelected.emit(x);
  }

  ngOnInit() {
  }

}
