import { RowEvent } from '@ag-grid-community/core';
import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppCacheService, PendingChangesService, Screen, ScreenService, SearchQuery, TranslateService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { AppSearchService } from '../../service/app-search.service';

@Component({
  selector: 'yuv-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss']
})
export class VersionsComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.app.versions';
  objectDetailsID: string;
  searchQuery: SearchQuery;
  selectedItems: string[] = [];
  smallScreen: boolean;
  private options = {
    'yuv-responsive-master-slave': { useStateLayout: true },
    'yuv-search-result-panel': null,
    'yuv-object-details': null
  };

  constructor(
    private titleService: Title,
    private screenService: ScreenService,
    private appCacheService: AppCacheService,
    public translate: TranslateService,
    private location: PlatformLocation,
    private appSearch: AppSearchService,
    private pendingChanges: PendingChangesService,
    private title: Title,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.screenService.screenChange$.pipe(takeUntilDestroy(this)).subscribe((screen: Screen) => {
      this.smallScreen = screen.mode === ScreenService.MODE.SMALL;
    });
  }

  closeDetails() {
    this.location.back();
  }

  onSlaveClosed() {
    if (!this.pendingChanges.check()) {
      this.select([]);
    }
  }

  onQueryChanged(query: SearchQuery) {
    this.appSearch.setQuery(query);
  }

  onOptionsChanged(options: any, component: string) {
    this.options[component] = options;
    this.appCacheService.setItem(this.getStorageKey(), this.options).subscribe();
  }

  getOptions(component: string) {
    return this.options[component];
  }

  select(items: string[]) {
    this.selectedItems = items;
    this.objectDetailsID = this.selectedItems[0];
  }

  onRowDoubleClicked(rowEvent: RowEvent) {
    if (rowEvent) {
      this.router.navigate(['/object/' + rowEvent.data.id]);
    }
  }

  onQueryDescriptionChange(desc: string) {
    this.title.setTitle(desc && desc.length ? desc : this.translate.instant('yuv.framework.search-result-panel.header.title'));
  }

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('yuv.client.state.result.title'));
    this.route.params.pipe(takeUntilDestroy(this)).subscribe((params: any) => {
      if (params.id) {
        // load versions
      }
    });
    // extract the query from the route params
    this.route.queryParamMap.pipe(takeUntilDestroy(this)).subscribe(params => {
      this.searchQuery = params.get('query') ? new SearchQuery(JSON.parse(params.get('query'))) : null;
      this.appCacheService.getItem(this.getStorageKey()).subscribe(o => (this.options = { ...this.options, ...o }));
    });
  }

  private getStorageKey() {
    return `${this.STORAGE_KEY}.${this.searchQuery && this.searchQuery.types.length === 1 ? this.searchQuery.types[0] : 'mixed'}`;
  }

  ngOnDestroy() {}
}
