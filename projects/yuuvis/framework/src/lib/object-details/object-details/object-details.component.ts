import { Component, Input, OnInit } from '@angular/core';
import { DmsObject, DmsService } from '@yuuvis/core';

@Component({
  selector: 'yuv-object-details',
  templateUrl: './object-details.component.html',
  styleUrls: ['./object-details.component.scss']
})
export class ObjectDetailsComponent implements OnInit {
  private _dmsObject: DmsObject;

  @Input()
  set dmsObject(object: DmsObject) {
    this._dmsObject = object;
  }

  get dmsObject() {
    return this._dmsObject;
  }

  @Input()
  set objectId(id: string) {
    this._dmsObject = null;
    if (id) {
      this.dmsService
        .getDmsObject(id)
        .subscribe(dmsObject => (this.dmsObject = dmsObject));
    }
  }

  constructor(private dmsService: DmsService) {}

  ngOnInit() {}
}
