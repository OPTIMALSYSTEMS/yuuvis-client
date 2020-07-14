import { Component, OnInit } from '@angular/core';
import { DmsObject } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-object-create',
  templateUrl: './test-object-create.component.html',
  styleUrls: ['./test-object-create.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestObjectCreateComponent implements OnInit {
  contextId: string;

  constructor() {}

  setContext(o: DmsObject) {
    this.contextId = o ? o.id : null;
  }

  onContextRemoved() {
    alert('Context removed');
    this.contextId = null;
  }

  ngOnInit() {}
}
