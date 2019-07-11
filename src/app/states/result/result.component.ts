import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  SearchQuery,
  SearchResult,
  SearchService,
  TranslateService
} from '@yuuvis/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'yuv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  searchResult: SearchResult;
  selectedItems: string[] = [];

  constructor(
    private titleService: Title,
    public translate: TranslateService,
    private searchService: SearchService,
    private location: PlatformLocation,
    private route: ActivatedRoute
  ) {}

  closeDetails() {
    this.location.back();
  }

  onSlaveClosed() {
    this.selectedItems = [];
  }

  select(items: string[]) {
    this.selectedItems = items;
  }

  executeQuery(query: string) {
    this.searchService
      .searchByQuery(new SearchQuery(JSON.parse(query)))
      .subscribe((res: SearchResult) => {
        this.searchResult = res;
      });
  }

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('eo.state.result.title'));
    // extract the query from the route params
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(params => {
        this.executeQuery(params.get('query'));
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
