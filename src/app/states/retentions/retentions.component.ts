import { ColDef, RowEvent } from '@ag-grid-community/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseObjectTypeField, DmsService, RetentionField, SearchFilter, SearchQuery, SortOption, SystemService, SystemSOT, Utils } from '@yuuvis/core';
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
  currentFilter: string;

  filterPanelConfig: FilterPanelConfig;
  selectedItems: string[] = [];
  plugins: any;
  objectDetailsID: string;
  searchQuery: SearchQuery;

  actionMenuVisible = false;
  actionMenuSelection = [];
  columnConfig: ColDef[];

  loading: boolean;

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
        cellRenderer: this.gridService.customContext((params) => {
          const context = params.context;
          const rtStart = params.data[RetentionField.RETENTION_START] ? new Date(params.data[RetentionField.RETENTION_START]) : null;
          const rtEnd = params.data[RetentionField.RETENTION_END] ? new Date(params.data[RetentionField.RETENTION_END]) : null;
          const rtDestruct = params.data[RetentionField.DESTRUCTION_DATE] ? new Date(params.data[RetentionField.DESTRUCTION_DATE]) : null;
          const today = new Date();

          if (rtStart && rtEnd) {
            const period = rtEnd.getTime() - rtStart.getTime();
            const diffNow = today.getTime() - rtStart.getTime();
            const p = (100 / period) * diffNow;

            const destcructUntil = p > 100 && rtDestruct ? Math.round(((rtEnd.getTime() - today.getTime()) / 1000 / 60 / 60) * 100) / 100 : null;
            const percentageDone = p <= 100 ? Math.round(p * 100) / 100 : null;

            const title = percentageDone
              ? this.translate.instant('yuv.client.state.retentions.renderer.status.inretention', { p: percentageDone })
              : destcructUntil >= 0
              ? this.translate.instant('yuv.client.state.retentions.renderer.status.indestruct', { d: destcructUntil })
              : this.translate.instant('yuv.client.state.retentions.renderer.status.pastdestruct', { d: destcructUntil * -1 });
            return percentageDone || destcructUntil
              ? destcructUntil !== null
                ? `<span title="${title}" class="chip red">${destcructUntil}h</span>`
                : `<span title="${title}" class="chip ${p < 100 ? 'green' : 'red'}">${percentageDone}%</span>`
              : '';
          } else {
            return '';
          }
        })
      },
      this.gridService.getColumnDefinition(this.systemService.system.allFields[BaseObjectTypeField.LEADING_OBJECT_TYPE_ID]),
      this.gridService.getColumnDefinition(this.systemService.system.allFields[this.systemService.getBaseProperties().title]),
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

  onRowDoubleClicked(rowEvent: RowEvent) {
    if (rowEvent) {
      Utils.navigate((rowEvent.event as MouseEvent).ctrlKey, this.router, ['/object/' + rowEvent.data.id]);
    }
  }

  openActionMenu() {
    if (this.selectedItems) {
      this.loading = true;
      this.dmsService.getDmsObjects(this.selectedItems).subscribe(
        (items) => {
          this.actionMenuSelection = items;
          this.actionMenuVisible = true;
          this.loading = false;
        },
        (err) => {
          this.loading = false;
        }
      );
    }
  }

  setFilter(filter: 'next' | 'destruct') {
    this.currentFilter = filter;

    const q = new SearchQuery();
    q.fields = [RetentionField.RETENTION_START, RetentionField.RETENTION_END, RetentionField.DESTRUCTION_DATE];
    q.addFilter(new SearchFilter(BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS, SearchFilter.OPERATOR.IN, [SystemSOT.DESTRUCTION_RETENTION]));
    q.addFilter(new SearchFilter(RetentionField.RETENTION_START, SearchFilter.OPERATOR.EQUAL, null, null, true));

    if (filter === 'next') {
      // apply filter to only get the recent ending retention
      const d = new Date();
      q.addFilter(new SearchFilter(RetentionField.RETENTION_END, SearchFilter.OPERATOR.LESS_OR_EQUAL, d.setDate(d.getDate() + 30)));
      q.addFilter(new SearchFilter(RetentionField.RETENTION_END, SearchFilter.OPERATOR.GREATER_OR_EQUAL, new Date()));
    } else if (filter === 'destruct') {
      // apply filter to only get the destruct ...
      q.addFilter(new SearchFilter(RetentionField.RETENTION_END, SearchFilter.OPERATOR.LESS_OR_EQUAL, new Date()));
    }
    q.sortOptions = [new SortOption(RetentionField.RETENTION_END, 'asc')];
    this.searchQuery = q;
  }

  ngOnInit(): void {
    this.setFilter('next');
  }
}
