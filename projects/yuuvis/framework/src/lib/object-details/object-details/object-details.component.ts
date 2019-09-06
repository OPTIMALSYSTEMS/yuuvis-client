import { Component, Input } from '@angular/core';
import { DmsObject, DmsService, SystemService, UserService } from '@yuuvis/core';
import { CellRenderer } from '../../services/grid/grid.cellrenderer';
import { SVGIcons } from '../../svg.generated';

/**
 * High level component displaying detail aspects for a given DmsObject.
 * 
 * 
 * ```html
<!-- string input validating input to be between 5 and 10 characters -->
<yuv-string [minLength]="5" [maxLength]="10"></yuv-string>
```
 *
 * ```html
<!-- string input that only allow digits -->
<yuv-string  [regex]="[0-9]*"></yuv-string>
```
 *
 * ```html
<!-- string input rendering a large textarea -->
<yuv-string [multiline]="true" [size]="'large'"></yuv-string>
```
 *
 */
@Component({
  selector: 'yuv-object-details',
  templateUrl: './object-details.component.html',
  styleUrls: ['./object-details.component.scss'],
  host: { class: 'yuv-object-details' }
})
export class ObjectDetailsComponent {
  objectIcon: string = '';
  icons = SVGIcons;
  // showSideBar = false;
  // sidebarStyle = { background: 'rgba(0, 0, 0, 0.8)' };
  // headerStyle = {
  //   'grid-template-columns': '0.1fr 1fr',
  //   'grid-template-areas': 'close content'
  // };
  // position = Position.RIGHT;
  busy: boolean;
  userIsAdmin: boolean;

  private _dmsObject: DmsObject;
  private _objectId: string;

  /**
   *
   */
  @Input()
  set dmsObject(object: DmsObject) {
    this._dmsObject = object;
    if (object) {
      this.objectIcon = CellRenderer.typeCellRenderer(null, this.systemService.getLocalizedResource(`${object.objectTypeId}_label`));
    }
  }

  get dmsObject() {
    return this._dmsObject;
  }

  @Input()
  set objectId(id: string) {
    if (id) {
      this._objectId = id;
      // this._dmsObject = null;
      this.getDmsObject(id);
    }
  }

  constructor(private dmsService: DmsService, private userService: UserService, private systemService: SystemService) {
    this.userIsAdmin = this.userService.hasAdministrationRoles;
  }

  private getDmsObject(id: string) {
    this.busy = true;
    this.dmsService.getDmsObject(id).subscribe(dmsObject => {
      this.dmsObject = dmsObject;
      this.busy = false;
    });
  }

  refreshDetails() {
    if (this._objectId) {
      this.getDmsObject(this._objectId);
    } else {
    }
  }

  // showActions() {
  //   this.showSideBar = !this.showSideBar;
  // }
}
