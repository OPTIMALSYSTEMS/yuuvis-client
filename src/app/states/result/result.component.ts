import { RowEvent } from '@ag-grid-community/core';
import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PendingChangesService, Screen, ScreenService, SearchQuery, TranslateService, Utils } from '@yuuvis/core';
import { FilterPanelConfig, LayoutService, PluginsService } from '@yuuvis/framework';
import { takeUntilDestroy } from 'take-until-destroy';
import { AppSearchService } from '../../service/app-search.service';

@Component({
  selector: 'yuv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.app.result';
  private LAYOUT_STORAGE_KEY = `${this.STORAGE_KEY}.layout`;
  objectDetailsID: string;
  searchQuery: SearchQuery;
  selectedItems: string[] = [];
  smallScreen: boolean;
  // showFilterPanel: boolean;
  filterPanelConfig: FilterPanelConfig;

  get layoutOptionsKey() {
    return `${this.STORAGE_KEY}.${(this.searchQuery && this.searchQuery.targetType) || 'mixed'}`;
  }

  plugins: any;

  constructor(
    private titleService: Title,
    private screenService: ScreenService,
    private appSearch: AppSearchService,
    public translate: TranslateService,
    private location: PlatformLocation,
    private pendingChanges: PendingChangesService,
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private router: Router,
    private pluginsService: PluginsService
  ) {
    this.screenService.screenChange$.pipe(takeUntilDestroy(this)).subscribe((screen: Screen) => {
      this.smallScreen = screen.mode === ScreenService.MODE.SMALL;
    });
    this.layoutService.loadLayoutOptions(this.LAYOUT_STORAGE_KEY, 'filterPanelConfig').subscribe((c: FilterPanelConfig) => {
      this.filterPanelConfig = c;
    });
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-result');
  }

  closeDetails() {
    this.location.back();
  }

  onSlaveClosed() {
    if (!this.pendingChanges.check()) {
      this.select([]);
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

  onQueryDescriptionChange(desc: string) {
    this.titleService.setTitle(desc && desc.length ? desc : this.translate.instant('yuv.framework.search-result-panel.header.title'));
  }

  ngOnInit() {
    // extract the query from the route params
    this.route.queryParamMap.pipe(takeUntilDestroy(this)).subscribe((params) => {
      this.searchQuery = params.get('query') ? new SearchQuery(JSON.parse(params.get('query'))) : null;
      // if the 'tmp' query param is est, the query will not be set
      // to the global app search
      const isTmpSearch = params.get('tmp');
      if (!isTmpSearch) {
        this.appSearch.setQuery(this.searchQuery);
      }
    });
  }

  ngOnDestroy() {}
}
