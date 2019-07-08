import { Component, Input, OnInit } from '@angular/core';
import { DmsObject, DmsService } from '@yuuvis/core';

@Component({
  selector: 'yuv-object-details',
  templateUrl: './object-details.component.html',
  styleUrls: ['./object-details.component.scss']
})
export class ObjectDetailsComponent implements OnInit {
  private _dmsObject: DmsObject;
  @Input() set dmsObject(o: DmsObject) {
    this._dmsObject = o;
  }

  get dmsObject() {
    return this._dmsObject;
  }

  @Input() set objectId(id: string) {
    this._dmsObject = null;
    if (id) {
      this.dmsService.getDmsObject(id).subscribe(o => (this.dmsObject = o));
    }
  }

  constructor(private dmsService: DmsService) {}

  ngOnInit() {}
}
