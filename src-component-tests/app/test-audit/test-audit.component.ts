import { Component, OnInit } from '@angular/core';
import { DmsObject } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-audit',
  templateUrl: './test-audit.component.html',
  styleUrls: ['./test-audit.component.scss']
})
export class TestAuditComponent implements OnInit {
  dmsObject: DmsObject;

  constructor() {}

  setDmsObject(o: DmsObject) {
    this.dmsObject = o;
  }

  ngOnInit() {}
}
