import { RowEvent } from '@ag-grid-community/core';
import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PendingChangesService, Screen, ScreenService, SearchQuery, TranslateService } from '@yuuvis/core';
import { LayoutService } from '@yuuvis/framework';
import { takeUntilDestroy } from 'take-until-destroy';
import { AppSearchService } from '../../service/app-search.service';

@Component({
  selector: 'yuv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.app.result';
  objectDetailsID: string;
  searchQuery: SearchQuery;
  selectedItems: string[] = [];
  smallScreen: boolean;
  // options = {
  //   'yuv-responsive-master-slave': { useStateLayout: true },
  //   'yuv-search-result-panel': null,
  //   'yuv-object-details': null
  // };

  constructor(
    private titleService: Title,
    private screenService: ScreenService,
    private layoutService: LayoutService,
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

  // onOptionsChanged(options: any, component: string) {
  //   // do not set this.options because it is an input as well (circle in->out->in)
  //   const o = { ...this.options };
  //   o[component] = { ...options };
  //   this.layoutService.saveComponentLayout(this.getStorageKey(), o).subscribe();
  // }

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
    // extract the query from the route params
    this.route.queryParamMap.pipe(takeUntilDestroy(this)).subscribe(params => {
      this.searchQuery = params.get('query') ? new SearchQuery(JSON.parse(params.get('query'))) : null;
      this.appSearch.setQuery(this.searchQuery);
      // this.appCacheService.getItem(this.getStorageKey()).subscribe(o => (this.options = { ...this.options, ...o }));
      // this.layoutService.loadComponentLayout(this.getStorageKey()).subscribe(o => (this.options = { ...this.options, ...o }));

      // this.layoutService.loadLayoutOptions()
    });
  }

  getLayoutOptionsStorageKey() {
    return `${this.STORAGE_KEY}.${this.searchQuery && this.searchQuery.types.length === 1 ? this.searchQuery.types[0] : 'mixed'}`;
  }

  ngOnDestroy() {}
}
