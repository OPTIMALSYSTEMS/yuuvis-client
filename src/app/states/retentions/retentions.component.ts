import { ColDef, RowEvent } from '@ag-grid-community/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseObjectTypeField, DmsService, RetentionField, SearchFilter, SearchQuery, SystemService, SystemSOT, Utils } from '@yuuvis/core';
import { FilterPanelConfig, GridService, LayoutService, PluginsService, SearchResultComponent } from '@yuuvis/framework';

@Component({
  selector: 'yuv-retentions',
  templateUrl: './retentions.component.html',
  styleUrls: ['./retentions.component.scss']
})
export class RetentionsComponent implements OnInit {
  @ViewChild(SearchResultComponent) searchResultComponent: SearchResultComponent;

  private STORAGE_KEY = 'yuv.app.retentions';
  private LAYOUT_STORAGE_KEY = `${this.STORAGE_KEY}.layout`;
  layoutOptionsKey = this.STORAGE_KEY;

  filterPanelConfig: FilterPanelConfig;
  selectedItems: string[] = [];
  plugins: any;
  objectDetailsID: string;
  searchQuery: SearchQuery;

  actionMenuVisible = false;
  actionMenuSelection = [];
  columnConfig: ColDef[];

  constructor(
    public translate: TranslateService,
    private dmsService: DmsService,
    private gridService: GridService,
    private layoutService: LayoutService,
    private router: Router,
    private systemService: SystemService,
    private pluginsService: PluginsService
  ) {
    this.setupColumnDefinition();
    this.layoutService.loadLayoutOptions(this.LAYOUT_STORAGE_KEY, 'filterPanelConfig').subscribe((c: FilterPanelConfig) => {
      this.filterPanelConfig = c;
    });
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-retentions');
  }

  private setupColumnDefinition() {
    this.columnConfig = [
      {
        colId: `${GridService.AGGREGATED_COLUMN_PREFIX}state`,
        cellClass: 'aggDone',
        resizable: true,
        sortable: false,
        cellRenderer: (params) => {
          const rtStart = params.data[RetentionField.RETENTION_START] ? new Date(params.data[RetentionField.RETENTION_START]) : null;
          const rtEnd = params.data[RetentionField.RETENTION_END] ? new Date(params.data[RetentionField.RETENTION_END]) : null;
          const rtDestruct = params.data[RetentionField.DESTRUCTION_DATE] ? new Date(params.data[RetentionField.DESTRUCTION_DATE]) : null;
          const today = new Date();

          if (rtStart && rtEnd) {
            const period = rtEnd.getTime() - rtStart.getTime();
            const diffNow = today.getTime() - rtStart.getTime();
            const p = (100 / period) * diffNow;
            return p > 100 && rtDestruct
              ? `<span class="chip red">${Math.round(((rtEnd.getTime() - today.getTime()) / 1000 / 60 / 60) * 100) / 100}h</span>`
              : `<span class="chip ${p < 100 ? 'green' : 'red'}">${Math.round(p * 100) / 100}%</span>`;
          } else {
            return '';
          }
        }
      },
      this.gridService.getColumnDefinition(this.systemService.system.allFields[RetentionField.RETENTION_START]),
      this.gridService.getColumnDefinition(this.systemService.system.allFields[RetentionField.RETENTION_END]),
      this.gridService.getColumnDefinition(this.systemService.system.allFields[RetentionField.DESTRUCTION_DATE])
    ];
  }

  refresh() {
    if (this.searchResultComponent) {
      this.searchResultComponent.refresh();
    }
  }

  select(items: string[]) {
    this.selectedItems = items;
    this.objectDetailsID = this.selectedItems[0];
  }

  onFilterPanelConfigChanged(cfg: FilterPanelConfig) {
    this.filterPanelConfig = cfg;
    this.layoutService.saveLayoutOptions(this.LAYOUT_STORAGE_KEY, 'filterPanelConfig', cfg).subscribe();
  }

  onRowDoubleClicked(rowEvent: RowEvent) {
    if (rowEvent) {
      Utils.navigate((rowEvent.event as MouseEvent).ctrlKey, this.router, ['/object/' + rowEvent.data.id]);
    }
  }

  openActionMenu() {
    if (this.selectedItems) {
      this.dmsService.getDmsObjects(this.selectedItems).subscribe((items) => {
        this.actionMenuSelection = items;
        this.actionMenuVisible = true;
      });
    }
  }

  ngOnInit(): void {
    const q = new SearchQuery();
    q.fields = [RetentionField.RETENTION_START, RetentionField.RETENTION_END, RetentionField.DESTRUCTION_DATE];
    q.addFilter(new SearchFilter(BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS, SearchFilter.OPERATOR.IN, [SystemSOT.DESTRUCTION_RETENTION]));
    // q.addFilter(new SearchFilter(RetentionField.RETENTION_START, SearchFilter.OPERATOR.EQUAL, '*'));
    this.searchQuery = q;
  }
}
