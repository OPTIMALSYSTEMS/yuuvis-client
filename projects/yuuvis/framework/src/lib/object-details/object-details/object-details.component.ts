import { Component, Input, OnInit } from '@angular/core';
import { DmsObject, DmsService } from '@yuuvis/core';
import { CellRenderer } from '../../services/grid/grid.cellrenderer';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-object-details',
  templateUrl: './object-details.component.html',
  styleUrls: ['./object-details.component.scss']
})
export class ObjectDetailsComponent implements OnInit {
  objectIcon: string = '';
  icons = SVGIcons;
  showSideBar = false;

  private _dmsObject: DmsObject;
  private _dmsObject2: DmsObject;

  @Input() enableCompare = true;
  @Input() enableSync = false;
  @Input() cacheLayout = false;

  @Input() externalPanels = [];

  @Input()
  set dmsObject(object: DmsObject) {
    this._dmsObject = object;
    this.objectIcon = CellRenderer.typeCellRenderer(object.objectTypeId);
  }

  get dmsObject() {
    return this._dmsObject;
  }

  @Input()
  set dmsObject2(object: DmsObject) {
    this._dmsObject2 = object;
  }

  get dmsObject2() {
    return this._dmsObject2;
  }

  @Input()
  set objectId(id: string) {
    this._dmsObject = null;
    if (id) {
      this.dmsService.getDmsObject(id).subscribe(dmsObject => (this.dmsObject = dmsObject));
    }
  }

  constructor(private dmsService: DmsService) {}

  showActions() {
    this.showSideBar = !this.showSideBar;
  }

  ngOnInit() {}
}
