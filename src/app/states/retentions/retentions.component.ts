import { ColDef, RowEvent } from '@ag-grid-community/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseObjectTypeField, DmsService, RetentionField, SearchFilter, SearchQuery, SortOption, SystemService, SystemSOT, Utils } from '@yuuvis/core';
import {
  download,
  FilterPanelConfig,
  GridService,
  IconRegistryService,
  LayoutService,
  PluginsService,
  SearchResultComponent,
  SearchService
} from '@yuuvis/framework';
import { finalize } from 'rxjs';
import { retentionEnd, retentionStart } from '../../../assets/default/svg/svg';

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
  loadingSpinner = false;

  filterPanelConfig: FilterPanelConfig;
  selectedItems: string[] = [];
  plugins: any;
  searchPlugins: any;
  objectDetailsID: string;
  searchQuery: SearchQuery;
  executedQuery: SearchQuery;

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
    private pluginsService: PluginsService,
    private iconRegistry: IconRegistryService,
    private searchService: SearchService
  ) {
    this.iconRegistry.registerIcons([download]);
    this.setupColumnDefinition();
    this.layoutService.loadLayoutOptions(this.LAYOUT_STORAGE_KEY, 'filterPanelConfig').subscribe((c: FilterPanelConfig) => {
      this.filterPanelConfig = c;
    });
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-retentions');
    this.searchPlugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-search-result');
  }

  private setupColumnDefinition() {
    this.columnConfig = [
      {
        colId: `${GridService.AGGREGATED_COLUMN_PREFIX}state`,
        cellClass: 'aggDone',
        resizable: true,
        sortable: false,
        cellRenderer: this.gridService.customContext((params) => this.renderStatusColumn(params))
      },
      this.gridService.getColumnDefinition(this.systemService.system.allFields[BaseObjectTypeField.LEADING_OBJECT_TYPE_ID]),
      this.gridService.getColumnDefinition(this.systemService.system.allFields[this.systemService.getBaseProperties().title]),
      this.gridService.getColumnDefinition(this.systemService.system.allFields[RetentionField.RETENTION_START]),
      this.gridService.getColumnDefinition(this.systemService.system.allFields[RetentionField.RETENTION_END]),
      this.gridService.getColumnDefinition(this.systemService.system.allFields[RetentionField.DESTRUCTION_DATE]),
      ...this.getHiddenColumnConfigs()
    ];
  }

  private getHiddenColumnConfigs(): ColDef[] {
    return [this.gridService.getColumnDefinition(this.systemService.system.allFields[BaseObjectTypeField.TAGS])].map((cd) => ({ ...cd, hide: true }));
  }

  private renderStatusColumn(params) {
    let tpl: { icon: string; label: string; color: string; title: string };

    // retention state
    const rtStart = params.data[RetentionField.RETENTION_START] ? new Date(params.data[RetentionField.RETENTION_START]) : null;
    const rtEnd = params.data[RetentionField.RETENTION_END] ? new Date(params.data[RetentionField.RETENTION_END]) : null;
    const today = new Date();

    if (rtStart && rtEnd) {
      //  hours until retention end
      const _h = (rtEnd.getTime() - new Date().getTime()) / 1000 / 60 / 60;
      const retentionEnded = _h < 0;
      const h = Math.floor(Math.abs(_h));

      const label =
        h < 48
          ? `${h} ${this.translate.instant('yuv.state.retentions.renderer.h')}`
          : h < 24 * 30
          ? `${Math.floor(h / 24)} ${this.translate.instant('yuv.state.retentions.renderer.d')}`
          : h < 24 * 365
          ? `${Math.floor(h / 24 / 30)} ${this.translate.instant('yuv.state.retentions.renderer.m')}`
          : `${Math.floor(h / 24 / 365)} ${this.translate.instant('yuv.state.retentions.renderer.y')}`;

      tpl = {
        icon: retentionEnded ? retentionEnd.data : retentionStart.data,
        label,
        color: retentionEnded ? 'red' : 'green',
        title: retentionEnded
          ? this.translate.instant('yuv.state.retentions.renderer.chip.title.ended', { diff: label })
          : this.translate.instant('yuv.state.retentions.renderer.chip.title.running', { diff: label })
      };
    }

    return tpl ? `<span title="${tpl.title}" class="chip ${tpl.color}">${tpl.icon} ${tpl.label}</span>` : '';
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
      this.dmsService.getDmsObjects(this.selectedItems).subscribe({
        next: (items) => {
          this.actionMenuSelection = items;
          this.actionMenuVisible = true;
          this.loading = false;
        },
        error: (err) => (this.loading = false)
      });
    }
  }

  setFilter(filter: 'next' | 'destruct') {
    this.currentFilter = filter;

    const q = new SearchQuery();
    q.fields = [RetentionField.RETENTION_START, BaseObjectTypeField.TAGS, RetentionField.RETENTION_END, RetentionField.DESTRUCTION_DATE];
    q.addFilter(new SearchFilter(BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS, SearchFilter.OPERATOR.IN, [SystemSOT.DESTRUCTION_RETENTION]));
    q.addFilter(new SearchFilter(RetentionField.RETENTION_START, SearchFilter.OPERATOR.EQUAL, null, null, true));

    switch (filter) {
      case 'next':
        // apply filter to only get the recent ending retention
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        q.addFilter(new SearchFilter(RetentionField.RETENTION_END, SearchFilter.OPERATOR.LESS_OR_EQUAL, d.setDate(d.getDate() + 30)));
        q.addFilter(new SearchFilter(RetentionField.RETENTION_END, SearchFilter.OPERATOR.GREATER_OR_EQUAL, new Date()));
        break;
      case 'destruct':
        // apply filter to only get the destruct ...
        q.addFilter(new SearchFilter(RetentionField.RETENTION_END, SearchFilter.OPERATOR.LESS_OR_EQUAL, new Date()));
        break;
    }

    q.sortOptions = [new SortOption(RetentionField.RETENTION_END, 'asc')];
    this.searchQuery = q;
  }

  exportCSV() {
    this.loadingSpinner = true;
    this.searchService
      .exportSearchResult(this.searchQuery.toQueryJson(), this.translate.instant('yuv.client.state.retentions.title').replace(' ', '_'))
      .pipe(finalize(() => (this.loadingSpinner = false)))
      .subscribe();
  }

  ngOnInit(): void {
    this.setFilter('next');
  }
}
