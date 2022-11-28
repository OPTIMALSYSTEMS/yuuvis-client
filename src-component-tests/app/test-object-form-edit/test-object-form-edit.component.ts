import { Component, OnInit, ViewChild } from '@angular/core';
import { DmsObject, SystemService } from '@yuuvis/core';
import { DmsObjectPickerComponent } from '../components/dms-object-picker/dms-object-picker.component';

@Component({
  selector: 'yuv-test-object-form-edit',
  templateUrl: './test-object-form-edit.component.html',
  styleUrls: ['./test-object-form-edit.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestObjectFormEditComponent implements OnInit {
  @ViewChild(DmsObjectPickerComponent) picker: DmsObjectPickerComponent;
  dmsObject: DmsObject;
  disableWholeForm: boolean = false;
  visible: boolean;
  objectId: string;

  constructor(private system: SystemService) {}

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

  setObjectWithExtensions() {
    if (this.picker) this.picker.objectId = 'c3f399ee-30d1-4762-b4cd-13408c5fad2d';
  }

  ngOnInit() {}
}
