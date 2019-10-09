import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DmsObject, DmsService } from '@yuuvis/core';

@Component({
  selector: 'yuv-dms-object-picker',
  templateUrl: './dms-object-picker.component.html',
  styleUrls: ['./dms-object-picker.component.scss']
})
export class DmsObjectPickerComponent implements OnInit {
  form: FormGroup;
  error: string;

  @Output() dmsObject = new EventEmitter<DmsObject>();

  constructor(private fb: FormBuilder, private dmsService: DmsService) {
    this.form = this.fb.group({
      objectId: ['523d445f-bb49-4718-aee4-3d59b2d10d78', Validators.required]
    });
  }

  fetchDmsObject() {
    const id = this.form.value.objectId;
    if (!id || id.length === 0) {
      this.dmsObject = null;
    } else {
      this.dmsService.getDmsObject(id).subscribe(
        (o: DmsObject) => {
          if (!o) {
            this.dmsObject.emit(null);
            this.error = 'Object not found';
          } else {
            this.dmsObject.emit(o);
          }
        },
        err => {
          this.dmsObject.emit(null);
          this.error = err;
        }
      );
    }
  }

  ngOnInit() {}
}
