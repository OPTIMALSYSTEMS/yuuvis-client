import { Component, Input, OnInit } from '@angular/core';
import { DmsObject, DmsService } from '@yuuvis/core';
import { ActionShowCommand } from '../../actions';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-object-details',
  templateUrl: './object-details.component.html',
  styleUrls: ['./object-details.component.scss']
})
export class ObjectDetailsComponent implements OnInit {
  private _dmsObject: DmsObject;

  icKebap = SVGIcons.kebap;

  actionCMD: ActionShowCommand = { show: false, selection: [] };

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

  constructor(private dmsService: DmsService) { }

  openActionMenu() {
    this.actionCMD = { show: true, selection: [this.dmsObject], target: 'DMS_OBJECT' }
  }

  onActionFinish() {
    alert('HURZ');
  }

  ngOnInit() { }
}
