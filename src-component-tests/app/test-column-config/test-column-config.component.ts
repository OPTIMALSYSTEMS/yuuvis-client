import { Component, OnInit } from '@angular/core';
import { ObjectType } from '@yuuvis/core';

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

  setColumnConfigInputFromSelect(item: ObjectType) {
    this.columnConfigInput = item;
  }

  ngOnInit() {}
}
