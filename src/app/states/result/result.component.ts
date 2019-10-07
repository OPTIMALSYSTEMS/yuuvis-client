import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AppCacheService, Screen, ScreenService, SearchQuery, TranslateService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';

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
    private route: ActivatedRoute
  ) {
    this.screenService.screenChange$.pipe(takeUntilDestroy(this)).subscribe((screen: Screen) => {
      this.smallScreen = screen.mode === ScreenService.MODE.SMALL;
    });
  }

  closeDetails() {
    this.location.back();
  }

  onSlaveClosed() {
    // this.selectedItems = [];
    this.objectDetailsID = null;
  }

  onOptionsChanged(options: any, component: string) {
    // console.log(options, component);
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

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('yuv.client.state.result.title'));
    // extract the query from the route params

    this.route.queryParamMap.pipe(takeUntilDestroy(this)).subscribe(params => {
      // this.executeQuery(params.get('query'));
      this.searchQuery = params.get('query') ? new SearchQuery(JSON.parse(params.get('query'))) : null;
      this.appCacheService.getItem(this.getStorageKey()).subscribe(o => (this.options = { ...this.options, ...o }));
    });
  }

  private getStorageKey() {
    return `${this.STORAGE_KEY}.${this.searchQuery && this.searchQuery.types.length === 1 ? this.searchQuery.types[0] : 'mixed'}`;
  }

  ngOnDestroy() {}
}
