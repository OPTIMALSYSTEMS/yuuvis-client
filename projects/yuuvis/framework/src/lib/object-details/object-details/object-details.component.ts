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
  favorite = SVGIcons.favorite;
  refresh = SVGIcons.refresh;
  edit = SVGIcons.edit;

  showSideBar = false;

  private _dmsObject: DmsObject;

  @Input()
  set dmsObject(object: DmsObject) {
    this._dmsObject = object;
    this.objectIcon = CellRenderer.typeCellRenderer(object.objectTypeId);
  }

  get dmsObject() {
    return this._dmsObject;
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
