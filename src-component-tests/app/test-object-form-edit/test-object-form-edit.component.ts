import { Component, OnInit } from '@angular/core';
import { DmsObject } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-object-form-edit',
  templateUrl: './test-object-form-edit.component.html',
  styleUrls: ['./test-object-form-edit.component.scss']
})
export class TestObjectFormEditComponent implements OnInit {
  dmsObject: DmsObject;
  disableWholeForm: boolean = false;

  constructor() {}

  toggleDisabled() {
    this.disableWholeForm = !this.disableWholeForm;
  }

  setDmsObject(o: DmsObject) {
    this.dmsObject = o;
  }

  ngOnInit() {}
}
