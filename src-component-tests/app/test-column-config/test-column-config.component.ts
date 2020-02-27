import { Component, OnInit } from '@angular/core';
import { ObjectType } from '@yuuvis/core';
import { ColumnConfigSelectItem } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-column-config',
  templateUrl: './test-column-config.component.html',
  styleUrls: ['./test-column-config.component.scss']
})
export class TestColumnConfigComponent implements OnInit {
  columnConfigInput: string | ObjectType;

  constructor() {}

  setColumnConfigInput(type: string) {
    this.columnConfigInput = type;
  }

  setColumnConfigInputFromSelect(item: ColumnConfigSelectItem) {
    this.columnConfigInput = item.type;
  }

  ngOnInit() {}
}
