import { Component, ContentChildren, HostBinding, Input, OnDestroy, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { ConfigService, DmsObject, DmsService, EventService, SystemService, UserService, YuvEvent, YuvEventType } from '@yuuvis/core';
import { TabPanel } from 'primeng/tabview';
import { takeUntilDestroy } from 'take-until-destroy';
import { CellRenderer } from '../../services/grid/grid.cellrenderer';
import { kebap, noFile, refresh } from '../../svg.generated';
import { ContentPreviewService } from '../content-preview/service/content-preview.service';
import { ResponsiveTabContainerComponent } from './../../components/responsive-tab-container/responsive-tab-container.component';

/**
 * High level component displaying detail aspects for a given DmsObject.
 * It will also take care of actions that could be executed for or with the
 * current dms object, like for example downloading original content file.
 *
 * The component provides the following object aspects:
 *
 * - **Summary**: Summary of the object including indexdata and content related information
 * - **Indexdata**: Indexdata form for editing the objects indexdata
 * - **Content**: Preview of the document file attached to the object
 * - **History**: Documentation of the objects lifecycle (audits)
 *
 * [Screenshot](../assets/images/yuv-object-details.gif)
 *
 * @example
 * <yuv-object-details [objectId]="'0815'"></yuv-object-details>
 */
@Component({
  selector: 'yuv-object-details',
  templateUrl: './object-details.component.html',
  styleUrls: ['./object-details.component.scss'],
  providers: [ContentPreviewService]
})
export class ObjectDetailsComponent implements OnDestroy {
  @ContentChildren(TabPanel) externalPanels: QueryList<TabPanel>;
  @ViewChildren(TabPanel) viewPanels: QueryList<TabPanel>;
  @ViewChild(ResponsiveTabContainerComponent, { static: false }) tabContainer: ResponsiveTabContainerComponent;
  @ViewChild('summary', { static: false }) summary: TemplateRef<any>;
  @ViewChild('indexdata', { static: false }) indexdata: TemplateRef<any>;
  @ViewChild('preview', { static: false }) preview: TemplateRef<any>;
  @ViewChild('history', { static: false }) history: TemplateRef<any>;

  @HostBinding('class.yuv-object-details') _hostClass = true;
  nofileIcon = noFile.data;
  objectIcon = '';
  busy: boolean;
  userIsAdmin: boolean;
  actionMenuVisible = false;
  actionMenuSelection = [];

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
      this.objectIcon = CellRenderer.typeCellRenderer({ value: object.objectTypeId, context: { system: this.systemService } });
    }
  }

  get dmsObject() {
    return this._dmsObject;
  }

  /**
   * ID of a DmsObject. The object will be fetched from the backend upfront.
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
   * If you provide a search term here, the object details (content preview) will
   * try to highlight this term within the objects content file. Depending on the
   * type of viewer rendering the objects content, this may be supported or not.
   */
  @Input() searchTerm = '';

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() layoutOptionsKey: string;

  /**
   * Set the active tab. Provide either the TabPanel instance or the key of the
   * tab that should be active.
   */
  @Input()
  set activeTabPanel(panel: TabPanel | string) {
    setTimeout(
      () => this.tabContainer && this.tabContainer.open(panel || this.tabContainer.mainTabView.tabs.find(t => !t.disabled)),
      this.tabContainer ? 0 : 200
    );
  }

  /**
   * If you want to set the order of the tabs within object details, you can use
   * this input property. The tab order will be defined by the index of the
   * input array containing the following values in the desired order:
   *
   * - `summary`: Object summary tab
   * - `indexdata`: Indexdata edit form tab
   * - `preview`: Content preview tab
   * - `history: Object history tab (audits)
   */
  @Input() panelOrder = ['summary', 'indexdata', 'preview', 'history'];
  /**
   * By default this component allows dropping files onto it, which then will replace
   * the dms objects content (which creates a new version of the object). If you wand
   * to disable this behaviour, set `disableFileDrop` to true.
   *
   * Dropping files will also be disabled, if the user lacks the permission to
   * edit objects contents.
   *
   * An example usage of not allowing files to be dropped, would be showing older
   * versions of an object.
   */
  @Input() disableFileDrop: boolean;

  constructor(
    private dmsService: DmsService,
    private userService: UserService,
    private systemService: SystemService,
    private eventService: EventService,
    private config: ConfigService,
    private contentPreviewService: ContentPreviewService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([refresh, kebap, noFile]);
    this.userIsAdmin = this.userService.hasAdministrationRoles;
    this.panelOrder = this.config.get('objectDetailsTabs') || this.panelOrder;

    this.eventService
      .on(YuvEventType.DMS_OBJECT_UPDATED)
      .pipe(takeUntilDestroy(this))
      .subscribe((e: YuvEvent) => {
        const dmsObject = e.data as DmsObject;
        if (dmsObject.id === this.dmsObject.id) {
          this.dmsObject = dmsObject;
        }
      });
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

  ngOnDestroy() {}
}
