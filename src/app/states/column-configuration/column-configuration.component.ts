import { Component, OnInit } from '@angular/core';
import { ObjectType } from '@yuuvis/core';

@Component({
  selector: 'yuv-column-configuration',
  templateUrl: './column-configuration.component.html',
  styleUrls: ['./column-configuration.component.scss']
})
export class ColumnConfigurationComponent implements OnInit {
  options = { masterSize: 30, masterMinSize: 20, slaveSize: 70, slaveMinSize: 30, direction: 'horizontal', resizable: true, useStateLayout: false };
  columnConfigInput: any;

  constructor() {}

  setColumnConfigInput(type: ObjectType) {
    this.columnConfigInput = { type };
  }

  ngOnInit() {}
}
