import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Screen, ScreenService, SearchQuery, TranslateService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {
  objectDetailsID: string;
  searchQuery: SearchQuery;
  selectedItems: string[] = [];
  smallScreen: boolean;

  constructor(
    private titleService: Title,
    private screenService: ScreenService,
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
    });
  }

  ngOnDestroy() {}
}
