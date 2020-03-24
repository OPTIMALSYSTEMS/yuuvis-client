import { Component, ContentChildren, HostBinding, Input, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { ConfigService, DmsObject, DmsService, SystemService, UserService } from '@yuuvis/core';
import { TabPanel } from 'primeng/tabview';
import { CellRenderer } from '../../services/grid/grid.cellrenderer';
import { kebap, noFile, refresh } from '../../svg.generated';
import { ContentPreviewService } from '../content-preview/service/content-preview.service';
import { ResponsiveTabContainerComponent } from './../../components/responsive-tab-container/responsive-tab-container.component';

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
  @ContentChildren(TabPanel) externalPanels: QueryList<TabPanel>;
  @ViewChildren(TabPanel) viewPanels: QueryList<TabPanel>;
  @ViewChild(ResponsiveTabContainerComponent, { static: false }) tabContainer: ResponsiveTabContainerComponent;

  @HostBinding('class.yuv-object-details') _hostClass = true;
  nofileIcon = noFile.data;
  objectIcon = '';
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
    this.contentPreviewService.resetSource();
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
    this._objectId = id;
    if (id) {
      this.getDmsObject(id);
    } else {
      this.dmsObject = null;
    }
  }

  get objectId() {
    return this._objectId;
  }

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() layoutOptionsKey: string;
  @Input()
  set activeTabPanel(panel: TabPanel | string) {
    setTimeout(() => panel && this.tabContainer && this.tabContainer.open(panel), this.tabContainer ? 0 : 200);
  }

  @ViewChild('summary', { static: false }) summary: TemplateRef<any>;
  @ViewChild('indexdata', { static: false }) indexdata: TemplateRef<any>;
  @ViewChild('preview', { static: false }) preview: TemplateRef<any>;
  @ViewChild('history', { static: false }) history: TemplateRef<any>;

  @Input() panelOrder = ['summary', 'indexdata', 'preview', 'history'];

  constructor(
    private dmsService: DmsService,
    private userService: UserService,
    private systemService: SystemService,
    private config: ConfigService,
    private contentPreviewService: ContentPreviewService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([refresh, kebap, noFile]);
    this.userIsAdmin = this.userService.hasAdministrationRoles;
    this.panelOrder = this.config.get('objectDetailsTabs') || this.panelOrder;
  }

  onFileDropped(file: File) {
    if (this.dmsObject.rights && this.dmsObject.rights.writeContent) {
      this.dmsService.uploadContent(this.dmsObject.id, file).subscribe();
    }
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
