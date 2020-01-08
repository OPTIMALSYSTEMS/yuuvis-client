import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { DmsObject, DmsService, SystemService, UserService } from '@yuuvis/core';
import { CellRenderer } from '../../services/grid/grid.cellrenderer';
import { SVGIcons } from '../../svg.generated';
import { ContentPreviewService } from '../content-preview/service/content-preview.service';

/**
 * High level component displaying detail aspects for a given DmsObject.
 *
 */
@Component({
  selector: 'yuv-object-details',
  templateUrl: './object-details.component.html',
  styleUrls: ['./object-details.component.scss'],
  providers: [ContentPreviewService]
})
export class ObjectDetailsComponent {
  @HostBinding('class.yuv-object-details') _hostClass = true;
  objectIcon = '';
  icons = SVGIcons;
  busy: boolean;
  userIsAdmin: boolean;
  actionMenuVisible = false;
  actionMenuSelection = [];

  @Input() searchTerm = '';

  private _dmsObject: DmsObject;
  private _objectId: string;

  /**
   * DmsObject to show the details for.
   */
  @Input()
  set dmsObject(object: DmsObject) {
    this._dmsObject = object;
    this._objectId = object ? object.id : null;
    if (object) {
      this.objectIcon = CellRenderer.typeCellRenderer(null, this.systemService.getLocalizedResource(`${object.objectTypeId}_label`));
    }
  }

  get dmsObject() {
    return this._dmsObject;
  }

  /**
   * You can also just provide the component with an ID of a DmsObject. It will then fetch it upfront.
   */
  @Input()
  set objectId(id: string) {
    if (id) {
      this._objectId = id;
      this.getDmsObject(id);
    }
  }

  get objectId() {
    return this._objectId;
  }

  @Input() standaloneFullscreen: boolean;
  @Output() standaloneFullscreenBackButtonClick = new EventEmitter();

  @Input() options;
  @Output() optionsChanged = new EventEmitter();

  constructor(
    private dmsService: DmsService,
    private userService: UserService,
    private systemService: SystemService,
    private contentPreviewService: ContentPreviewService
  ) {
    this.userIsAdmin = this.userService.hasAdministrationRoles;
  }

  standaloneBackButtonClicked() {
    this.standaloneFullscreenBackButtonClick.emit();
  }

  onFileDropped(file: File) {
    console.log(file);
    this.dmsService.uploadContent(this.dmsObject.id, file).subscribe();
  }

  onIndexdataSaved(updatedObject: DmsObject) {
    this.dmsObject = updatedObject;
  }

  openActionMenu() {
    this.actionMenuSelection = [this.dmsObject];
    this.actionMenuVisible = true;
  }

  private getDmsObject(id: string) {
    this.busy = true;
    this.contentPreviewService.resetSource();
    this.dmsService.getDmsObject(id).subscribe(dmsObject => {
      this.dmsObject = dmsObject;
      this.busy = false;
    });
  }

  refreshDetails() {
    if (this._objectId) {
      this.getDmsObject(this._objectId);
    }
  }
}
