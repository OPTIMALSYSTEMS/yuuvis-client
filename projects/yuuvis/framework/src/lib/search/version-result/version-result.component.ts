import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IconRegistryService } from '@yuuvis/common-ui';
import { BaseObjectTypeField, DmsObject, DmsService, SecondaryObjectTypeField, TranslateService } from '@yuuvis/core';
import { forkJoin, of } from 'rxjs';
import { ResponsiveDataTableComponent, ViewMode } from '../../components';
import { ResponsiveTableData } from '../../components/responsive-data-table/responsive-data-table.interface';
import { listModeDefault, listModeGrid, listModeSimple, refresh, versions } from '../../svg.generated';
import { GridService } from './../../services/grid/grid.service';

@Component({
  selector: 'yuv-version-result',
  templateUrl: './version-result.component.html',
  styleUrls: ['./version-result.component.scss'],
  host: { class: 'yuv-version-result' }
})
export class VersionResultComponent implements OnInit {
  selection: string[] = [];

  dmsObjectID: string;
  @Input() set objectID(id: string) {
    this.dmsObjectID = id;
    this.refresh();
  }

  @Input() set versions(vs: string[]) {
    this.selection = (vs || []).filter(v => v).map(v => this.getRowNodeId(v));
    this.setLatestVersion();
  }

  @Output() dmsObjectsSelected = new EventEmitter<DmsObject[]>();

  @ViewChild('dataTable', { static: false }) dataTable: ResponsiveDataTableComponent;

  tableData: ResponsiveTableData;

  /**
   * view mode of the table
   */
  @Input() set viewMode(viewMode: ViewMode) {
    if (this.dataTable) {
      this.dataTable.viewMode = viewMode || 'horizontal';
    }
  }

  @Input() layoutOptionsKey: string;

  constructor(
    public translate: TranslateService,
    private dmsService: DmsService,
    private iconRegistry: IconRegistryService,
    private gridService: GridService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.iconRegistry.registerIcons([refresh, versions, listModeDefault, listModeGrid, listModeSimple]);
  }

  getVersion(o: any) {
    return o[BaseObjectTypeField.VERSION_NUMBER] || o.version || o;
  }

  getRowNodeId(o: any) {
    return o ? this.dmsObjectID + '_' + this.getVersion(o) : '';
  }

  select(items: any[]) {
    const vs = items.map(a => this.getVersion(a));
    const [v1, v2] = [
      vs.shift(), // focused version first
      vs.sort().pop() // highest version second
    ].sort(); // compare lower version against higher

    if (items.length > 2) {
      // reset selection
      this.selection = [this.getRowNodeId(v1), this.getRowNodeId(v2)];
    } else {
      const o = [v1, v2].filter(v => v).map(v => this.dmsService.getDmsObject(this.dmsObjectID, v));
      forkJoin(o.length ? o : of(null)).subscribe(objects => {
        this.dmsObjectsSelected.emit(objects);
      });
    }
  }

  setLatestVersion() {
    if (this.tableData && this.tableData.rows) {
      this.router.navigate([], {
        fragment: this.getVersion(this.tableData.rows[0]).toString(),
        replaceUrl: false,
        relativeTo: this.route,
        queryParamsHandling: 'preserve'
      });
    }
  }

  getColumnDefinitions() {
    const defs = this.gridService.getColumnDefinitions();
    const cols = [
      BaseObjectTypeField.VERSION_NUMBER,
      SecondaryObjectTypeField.TITLE,
      SecondaryObjectTypeField.DESCRIPTION,
      BaseObjectTypeField.MODIFICATION_DATE
    ].map(f => defs.find(d => d.field === f));
    cols[0].pinned = true;
    return cols;
  }

  refresh() {
    this.dmsService.getDmsObjectVersions(this.dmsObjectID).subscribe(rows => {
      this.tableData = {
        columns: this.getColumnDefinitions(),
        rows: rows.map(a => a.data).sort((a, b) => this.getVersion(b) - this.getVersion(a)),
        titleField: SecondaryObjectTypeField.TITLE,
        descriptionField: SecondaryObjectTypeField.DESCRIPTION,
        selectType: 'multiple',
        gridOptions: { getRowNodeId: o => this.getRowNodeId(o), rowMultiSelectWithClick: true }
      };
      this.setLatestVersion();
    });
  }

  ngOnInit() {}
}
