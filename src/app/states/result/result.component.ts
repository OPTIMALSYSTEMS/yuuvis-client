import { PlatformLocation } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SearchQuery, TranslateService } from '@yuuvis/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'yuv-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  objectDetailsID: string;
  searchQuery: SearchQuery;
  selectedItems: string[] = [];

  constructor(private titleService: Title, public translate: TranslateService, private location: PlatformLocation, private route: ActivatedRoute) {}

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
    this.titleService.setTitle(this.translate.instant('eo.state.result.title'));
    // extract the query from the route params
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(params => {
        // this.executeQuery(params.get('query'));
        this.searchQuery = params.get('query') ? new SearchQuery(JSON.parse(params.get('query'))) : null;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
