import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IconRegistryService } from '@yuuvis/common-ui';
import { BaseObjectTypeField, ContentStreamField, DmsObject, DmsService, RetentionField, SecondaryObjectTypeField, TranslateService } from '@yuuvis/core';
import { forkJoin, of } from 'rxjs';
import { ResponsiveDataTableComponent, ViewMode } from '../../components';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { GridService } from '../../services/grid/grid.service';
import { arrowNext, listModeDefault, listModeGrid, listModeSimple, refresh, versions } from '../../svg.generated';

/**
 * Component showing a list of all versions of a dms object.
 */
@Component({
  selector: 'yuv-version-list',
  templateUrl: './version-list.component.html',
  styleUrls: ['./version-list.component.scss']
})
export class VersionListComponent {
  @ViewChild('dataTable', { static: false }) dataTable: ResponsiveDataTableComponent;

  private COLUMN_CONFIG_SKIP_FIELDS = [
    ...Object.keys(RetentionField).map(k => RetentionField[k]),
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
  dmsObjectID: string;
  // latest version of the current dms object
  activeVersion: DmsObject;
  compareForm: FormGroup;

  /**
   * ID of the dms object to list the versions for.
   */
  @Input() set objectID(id: string) {
    this.dmsObjectID = id;
    this.refresh();
  }

  /**
   * Array of version numbers to be selected upfront.
   */
  @Input() set versions(vs: string[]) {
    this.selection = (vs || []).filter(v => v).map(v => this.getRowNodeId(v));
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
   * Emitted once one or more versions from the list were selected.
   */
  @Output() versionSelected = new EventEmitter<DmsObject[]>();

  constructor(
    public translate: TranslateService,
    private fb: FormBuilder,
    private dmsService: DmsService,
    private iconRegistry: IconRegistryService,
    private gridService: GridService
  ) {
    this.iconRegistry.registerIcons([arrowNext, refresh, versions, listModeDefault, listModeGrid, listModeSimple]);
    this.compareForm = this.fb.group({
      versionOne: [],
      versionTwo: []
    });
    this.compareForm.valueChanges.subscribe(v => {
      console.log(v);
    });
  }

  private getVersion(o: any) {
    return o[BaseObjectTypeField.VERSION_NUMBER] || o.version || o;
  }

  private getRowNodeId(o: any) {
    return o ? this.dmsObjectID + '_' + this.getVersion(o) : '';
  }

  select(items: any[]) {
    const vs = items.map(a => this.getVersion(a));
    const [v1, v2] = [
      vs.shift(), // focused version first
      vs.sort().pop() // highest version second
    ].sort(); // compare lower version against higher

    // if (items.length > 2) {
    //   // reset selection
    //   this.selection = [this.getRowNodeId(v1), this.getRowNodeId(v2)];
    // } else {
    const o = [v1, v2].filter(v => v).map(v => this.dmsService.getDmsObject(this.dmsObjectID, v));
    forkJoin(o.length ? o : of(null)).subscribe(objects => {
      this.versionSelected.emit(objects);
    });
    // }
  }

  private getColumnDefinitions(objectTypeId: string) {
    const defs = this.gridService.getColumnDefinitions(objectTypeId).filter(d => !this.COLUMN_CONFIG_SKIP_FIELDS.includes(d.field));
    const coreColumnIds = [BaseObjectTypeField.VERSION_NUMBER, SecondaryObjectTypeField.TITLE, SecondaryObjectTypeField.DESCRIPTION];
    const coreColumns = coreColumnIds.map(f => defs.find(d => d.field === f));
    coreColumns[0].pinned = true;
    return [...coreColumns, ...defs.filter(d => !coreColumnIds.includes(d.field))];
  }

  refresh() {
    if (this.dmsObjectID) {
      this.dmsService.getDmsObjectVersions(this.dmsObjectID).subscribe((rows: DmsObject[]) => {
        const objectTypeId = rows && rows.length ? rows[0].objectTypeId : null;
        const sorted = rows.sort((a, b) => this.getVersion(b) - this.getVersion(a));
        this.tableData = {
          columns: this.getColumnDefinitions(objectTypeId),
          rows: sorted.map(a => a.data),
          titleField: SecondaryObjectTypeField.TITLE,
          descriptionField: SecondaryObjectTypeField.DESCRIPTION,
          selectType: 'multiple',
          gridOptions: { getRowNodeId: o => this.getRowNodeId(o), rowMultiSelectWithClick: false }
        };
        this.activeVersion = sorted[0];
        this.compareForm.patchValue({
          versionOne: this.activeVersion.version
        });
      });
    } else {
      this.tableData = null;
      this.activeVersion = null;
    }
  }
}
