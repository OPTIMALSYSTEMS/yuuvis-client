import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  @Input() defaultId: string;
  @Output() dmsObject = new EventEmitter<DmsObject>();

  constructor(private fb: FormBuilder, private dmsService: DmsService) {}

  fetchDmsObject() {
    this.error = null;
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
          this.error = err.message;
        }
      );
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      objectId: [this.defaultId ? this.defaultId : 'aeb19b4b-d44b-4dfb-b852-d0358c7cc294', Validators.required]
    });
  }
}
