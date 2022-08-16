import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BaseObjectTypeField, DmsObject, DmsService, SearchQuery, SearchService, SystemType } from '@yuuvis/core';

@Component({
  selector: 'yuv-dms-object-picker',
  templateUrl: './dms-object-picker.component.html',
  styleUrls: ['./dms-object-picker.component.scss']
})
export class DmsObjectPickerComponent implements OnInit {
  form: UntypedFormGroup;
  error: string;

  // query to fetch item that should be selected upfront
  @Input() objectQuery: SearchQuery;
  @Output() dmsObject = new EventEmitter<DmsObject>();

  constructor(private fb: UntypedFormBuilder, private searchService: SearchService, private dmsService: DmsService) {
    this.form = this.fb.group({
      objectId: ['', Validators.required]
    });
  }

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
        (err) => {
          this.dmsObject.emit(null);
          this.error = err.message;
        }
      );
    }
  }

  private executeObjectQuery(q: SearchQuery) {
    q.size = 1;
    q.fields = [BaseObjectTypeField.OBJECT_ID];
    this.searchService.search(q).subscribe(
      (res) => {
        if (res.items.length) {
          const id = res.items[0].fields.get(BaseObjectTypeField.OBJECT_ID);
          this.form.patchValue({ objectId: id });
          this.fetchDmsObject();
        }
      },
      (err) => {
        this.error = err;
      }
    );
  }

  ngOnInit() {
    this.executeObjectQuery(this.objectQuery || new SearchQuery({ types: [SystemType.DOCUMENT] }));
  }
}
