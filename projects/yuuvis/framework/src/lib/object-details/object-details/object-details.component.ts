import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Position } from '@yuuvis/common-ui';
import { DmsObject, DmsService, SystemService } from '@yuuvis/core';
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
  sidebarStyle = { background: 'rgba(0, 0, 0, 0.8)' };
  headerStyle = {
    'grid-template-columns': '0.1fr 1fr',
    'grid-template-areas': 'close content'
  };
  position = Position.RIGHT;
  private _dmsObject: DmsObject;
  private _dmsObject2: DmsObject;

  @HostBinding('class.busy') busy = false;
  @Input() enableCompare = true;
  @Input() enableSync = false;
  @Input() cacheLayout = false;

  @Input() externalPanels = [];

  @Input()
  set dmsObject(object: DmsObject) {
    this._dmsObject = object;
    this.objectIcon = CellRenderer.typeCellRenderer(null, this.systemService.getLocalizedResource(`${object.objectTypeId}_label`));
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
    if (id) {
      // this._dmsObject = null;
      this.busy = true;
      this.dmsService.getDmsObject(id).subscribe(dmsObject => {
        this.dmsObject = dmsObject;
        this.busy = false;
      });
    }
  }

  constructor(private dmsService: DmsService, private systemService: SystemService) {}

  showActions() {
    this.showSideBar = !this.showSideBar;
  }

  ngOnInit() {}

  ngOnDestroy() {
    console.log('SEARCH AND DRESTROY');
  }
}
