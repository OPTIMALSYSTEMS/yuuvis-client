import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DmsObject, DmsService } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-object-form-edit',
  templateUrl: './test-object-form-edit.component.html',
  styleUrls: ['./test-object-form-edit.component.scss']
})
export class TestObjectFormEditComponent implements OnInit {
  form: FormGroup;
  dmsObject: DmsObject;
  disableWholeForm: boolean = false;

  constructor(private fb: FormBuilder, private dmsService: DmsService) {
    this.form = this.fb.group({
      objectId: ['523d445f-bb49-4718-aee4-3d59b2d10d78', Validators.required]
    });
  }

  toggleDisabled() {
    this.disableWholeForm = !this.disableWholeForm;
  }

  setDmsObject() {
    const id = this.form.value.objectId;
    if (!id || id.length === 0) {
      this.dmsObject = null;
    } else {
      this.dmsService.getDmsObject(id).subscribe(
        (o: DmsObject) => (this.dmsObject = o),
        err => {
          this.dmsObject = null;
          console.error(err);
        }
      );
    }
  }

  onIndexDataSaved(formData: any) {
    console.log('IndexDataSaved', event);
  }

  ngOnInit() {}
}
