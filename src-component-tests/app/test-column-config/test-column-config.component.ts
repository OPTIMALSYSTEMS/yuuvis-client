import { Component, OnInit } from '@angular/core';
import { ColumnConfigInput, ColumnConfigSelectItem } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-column-config',
  templateUrl: './test-column-config.component.html',
  styleUrls: ['./test-column-config.component.scss']
})
export class TestColumnConfigComponent implements OnInit {
  columnConfigInput: ColumnConfigInput;

  constructor() {}

  setColumnConfigInput(type: string, context?: string) {
    this.columnConfigInput = {
      type: type,
      context: context
    };
  }

  setColumnConfigInputFromSelect(item: ColumnConfigSelectItem) {
    this.columnConfigInput = {
      type: item.type,
      context: item.context
    };
  }

  ngOnInit() {}
}
