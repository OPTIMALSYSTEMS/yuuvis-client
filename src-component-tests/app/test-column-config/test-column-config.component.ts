import { Component, OnInit } from '@angular/core';
import { ObjectType, SortOption } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-column-config',
  templateUrl: './test-column-config.component.html',
  styleUrls: ['./test-column-config.component.scss']
})
export class TestColumnConfigComponent implements OnInit {
  options: { type: string | ObjectType; sortOptions?: SortOption[] };

  constructor() {}

  setColumnConfigInput(type: string, sortOptions?: SortOption[]) {
    this.options = {
      type: type,
      sortOptions: sortOptions
    };
  }

  setColumnConfigInputFromSelect(item: ObjectType) {
    this.options = {
      type: item
    };
  }

  ngOnInit() {}
}
