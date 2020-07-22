import { Component, OnInit } from '@angular/core';
import { DmsObject } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-object-form-edit',
  templateUrl: './test-object-form-edit.component.html',
  styleUrls: ['./test-object-form-edit.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestObjectFormEditComponent implements OnInit {
  dmsObject: DmsObject;
  disableWholeForm: boolean = false;
  visible: boolean;

  constructor() {}

  toggleDisabled() {
    this.visible = false;
    setTimeout(() => {
      this.disableWholeForm = !this.disableWholeForm;
      this.visible = true;
    }, 0);
  }

  setDmsObject(o: DmsObject) {
    this.dmsObject = o;
    this.visible = true;
  }

  ngOnInit() {}
}
