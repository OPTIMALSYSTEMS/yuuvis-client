import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SearchQuery } from '@yuuvis/core';
import { ObjectTypeAggregation, QuickSearchComponent, RecentItem } from '@yuuvis/framework';
import { APP_VARS } from '../../app.vars';
import { AppSearchService } from '../../service/app-search.service';
@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: { class: 'themeBackground' }
})
export class DashboardComponent implements OnInit {
  @ViewChild('quickSearch', { static: true }) quickSearchEl: QuickSearchComponent;
  // application wide search query
  appQuery: SearchQuery;
  aggs: ObjectTypeAggregation[];

  constructor(private router: Router, private appSearch: AppSearchService, private titleService: Title) {}

  onShowAll(q: SearchQuery) {
    this.onQuickSearchQuery(q, true);
  }

  onRecentItemClicked(recentItem: RecentItem) {
    this.router.navigate(['/object/' + recentItem.objectId]);
  }

  onQuickSearchQuery(query: SearchQuery, preventAppSearchSet: boolean = false) {
    this.router
      .navigate(['/result'], {
        queryParams: { query: JSON.stringify(query.toQueryJson()) }
      })
      .then(_ => {
        if (!preventAppSearchSet) {
          this.appSearch.setQuery(query);
        }
      });
  }

  onTypeAggregation(aggs: ObjectTypeAggregation[]) {
    // this.aggs = aggs;
  }

  applyAggregation(agg: ObjectTypeAggregation) {
    this.quickSearchEl.applyTypeAggration(agg, true);
  }

  ngOnInit() {
    this.titleService.setTitle(APP_VARS.defaultPageTitle);
    this.appSearch.query$.subscribe((q: SearchQuery) => {
      this.appQuery = q;
    });
  }
}
