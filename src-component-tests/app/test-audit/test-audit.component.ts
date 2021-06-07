import { Component } from '@angular/core';
import { DmsObject } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-audit',
  templateUrl: './test-audit.component.html',
  styleUrls: ['./test-audit.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestAuditComponent {
  dmsObject: DmsObject;

  constructor() {}

  setDmsObject(o: DmsObject) {
    this.dmsObject = o;
  }
}
