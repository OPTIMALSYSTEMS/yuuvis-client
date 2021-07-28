import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BaseObjectTypeField, ClientDefaultsObjectTypeField, ContentStreamField, DmsObject, DmsService, RetentionField, TranslateService } from '@yuuvis/core';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { ResponsiveDataTableComponent, ViewMode } from '../../components';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { GridService } from '../../services/grid/grid.service';
import { arrowNext, edit, listModeDefault, listModeGrid, listModeSimple, refresh, versions } from '../../svg.generated';

/**
 * Component showing a list of all versions of a dms object.
 *
 * [Screenshot](../assets/images/yuv-version-list.gif)
 *
 * @example
 *
 * <yuv-version-list [objectID]="objectID" [versions]="versions" (editRecentClick)="onEditRecentClick($event)" (selectionChange)="onSelectionChange($event)"
 * [layoutOptionsKey]="layoutOptionsKey"></yuv-version-list>
 *
 *
 */
@Component({
  selector: 'yuv-version-list',
  templateUrl: './version-list.component.html',
  styleUrls: ['./version-list.component.scss']
})
export class VersionListComponent implements OnInit {
  @ViewChild('dataTable') dataTable: ResponsiveDataTableComponent;

  private COLUMN_CONFIG_SKIP_FIELDS = [
    ...Object.keys(RetentionField).map((k) => RetentionField[k]),
    BaseObjectTypeField.CREATED_BY,
    BaseObjectTypeField.CREATION_DATE,
    BaseObjectTypeField.OBJECT_ID,
    BaseObjectTypeField.CREATION_DATE,
    BaseObjectTypeField.CREATED_BY,
    BaseObjectTypeField.OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_ID,
    BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_VERSION_NUMBER,
    BaseObjectTypeField.TENANT,
    BaseObjectTypeField.TRACE_ID,
    BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS,
    BaseObjectTypeField.BASE_TYPE_ID,
    ContentStreamField.ID,
    ContentStreamField.RANGE,
    ContentStreamField.REPOSITORY_ID,
    ContentStreamField.DIGEST,
    ContentStreamField.ARCHIVE_PATH
  ];

  selection: string[] = [];
  tableData: ResponsiveTableData;
  busy: boolean;
  dmsObjectID: string;
  // latest version of the current dms object
  activeVersion: DmsObject;
  error: string;

  /**
   * ResponsiveTableData mixin for grid configuration
   */
  @Input() responsiveTableData: Partial<ResponsiveTableData>;

  /**
   * ID of the dms object to list the versions for.
   */
  @Input() set objectID(id: string) {
    this.dmsObjectID = id;
    this.refresh();
  }

  /**
   * If the version to be selected is the recent/latest version, the component
   * will also select the previous version (if there is more than one). To disable
   * this behaviour set this property to true.
   */
  @Input() disableAutoSelectOnRecentVersion: boolean;

  /**
   * Array of version numbers to be selected upfront.
   */
  @Input() set versions(vs: string[]) {
    this.selection = (vs || []).filter((v) => v).map((v) => this.getRowNodeId(v));
  }

  /**
   * Set the way the versions are visualized within the component. You may choose from
   * the default list view, a table view and a more content focused tile view.
   */
  @Input() set viewMode(viewMode: ViewMode) {
    if (this.dataTable) {
      this.dataTable.viewMode = viewMode || 'horizontal';
    }
  }

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() layoutOptionsKey: string;

  /**
   * Emitted once the selection has changed.
   */
  @Output() selectionChange = new EventEmitter<DmsObject[]>();

  /**
   * Emitted when the compare objects form has been submitted.
   */
  @Output() compareVersionsChange = new EventEmitter<DmsObject[]>();

  /**
   * Setting this output will draw an edit icon into the header, that
   * will trigger this emitter once it has been clicked
   */
  @Output() editRecentClick = new EventEmitter<string>();
  enableEdit: boolean;

  constructor(
    public translate: TranslateService,
    private fb: FormBuilder,
    private dmsService: DmsService,
    private iconRegistry: IconRegistryService,
    private gridService: GridService
  ) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, versions, listModeDefault, listModeGrid, listModeSimple]);
  }

  private getVersion(o: any) {
    return o[BaseObjectTypeField.VERSION_NUMBER] || o.version || o;
  }

  private getRowNodeId(o: any) {
    return o ? this.dmsObjectID + '_' + this.getVersion(o) : '';
  }

  select(items: any[]) {
    if (items && items.length <= 2) {
      this.versionsToObjects(items.map((a) => this.getVersion(a))).subscribe((objects: DmsObject[]) => {
        this.selectionChange.emit(objects);
      });
    }
  }

  private versionsToObjects(versions: number[]): Observable<DmsObject[]> {
    this.busy = true;
    const tasks = versions.filter((v) => v).map((v) => this.dmsService.getDmsObject(this.dmsObjectID, v));
    return (tasks.length ? forkJoin(tasks) : of([])).pipe(tap((_) => (this.busy = false)));
  }

  private getColumnDefinitions(objectTypeId: string) {
    const defs = this.gridService.getColumnDefinitions(objectTypeId).filter((d) => !this.COLUMN_CONFIG_SKIP_FIELDS.includes(d.field));
    const coreColumnIds = [BaseObjectTypeField.VERSION_NUMBER, ClientDefaultsObjectTypeField.TITLE, ClientDefaultsObjectTypeField.DESCRIPTION];
    // fetching column definitions we need to be aware that title and description may not be present
    const coreColumns = coreColumnIds.map((f) => defs.find((d) => d.field === f)).filter((def) => !!def);
    coreColumns[0].pinned = true;
    return [...coreColumns, ...defs.filter((d) => !coreColumnIds.includes(d.field))];
  }

  edit() {
    this.editRecentClick.emit(this.dmsObjectID);
  }

  refresh() {
    this.error = null;
    if (this.dmsObjectID) {
      this.dmsService.getDmsObjectVersions(this.dmsObjectID).subscribe(
        (rows: DmsObject[]) => {
          const objectTypeId = rows && rows.length ? rows[0].objectTypeId : null;
          const sorted = rows.sort((a, b) => this.getVersion(b) - this.getVersion(a));
          this.activeVersion = sorted[0];

          // having just one selected version that is also the recent version, will also select the
          // previous version as long as there are more than just one version, or
          // `disableAutoSelectOnRecentVersion` has been set to true
          if (
            !this.disableAutoSelectOnRecentVersion &&
            rows.length > 1 &&
            this.selection.length === 1 &&
            this.selection[0] === this.getRowNodeId(sorted[0].version)
          ) {
            this.selection.push(this.getRowNodeId(sorted[1].version));
          }

          this.tableData = {
            columns: this.getColumnDefinitions(objectTypeId),
            rows: sorted.map((a) => a.data),
            titleField: ClientDefaultsObjectTypeField.TITLE,
            descriptionField: ClientDefaultsObjectTypeField.DESCRIPTION,
            selectType: 'multiple',
            gridOptions: { getRowNodeId: (o) => this.getRowNodeId(o), rowMultiSelectWithClick: false },
            ...(this.responsiveTableData || {})
          };
        },
        (err) => {
          if (err) {
            this.error = this.translate.instant('yuv.framework.object-details.context.load.error');
          }
        }
      );
    } else {
      this.tableData = null;
      this.activeVersion = null;
    }
  }

  ngOnInit() {
    // only enable edit button if somone subscribed to the output emitter
    this.enableEdit = !!this.editRecentClick.observers.length;
  }
}
