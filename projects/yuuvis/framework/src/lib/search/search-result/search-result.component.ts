import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'yuv-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {

  @Input() items: any[];
  @Input() selectedItemId: string;
  @Output() itemSelected = new EventEmitter();


  constructor() { }

  select(x) {
    this.itemSelected.emit(x);
  }

  ngOnInit() {
  }

}
