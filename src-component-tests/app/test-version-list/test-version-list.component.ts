import { Component, OnInit } from '@angular/core';
import { DmsObject } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-version-list',
  templateUrl: './test-version-list.component.html',
  styleUrls: ['./test-version-list.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestVersionListComponent implements OnInit {
  dmsObject: DmsObject;

  constructor() {}

  setDmsObjectInput(dmsObject: DmsObject) {
    this.dmsObject = dmsObject;
  }

  ngOnInit() {}
}
