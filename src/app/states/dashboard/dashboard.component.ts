import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationExtras, Router } from '@angular/router';
import { EventService, SearchQuery, UserRoles, UserService, Utils, YuvEventType, YuvUser } from '@yuuvis/core';
import { ObjectTypeAggregation, QuickSearchComponent, RecentItem } from '@yuuvis/framework';
import { APP_VARS } from '../../app.vars';
import { FrameService } from '../../components/frame/frame.service';
import { AppSearchService } from '../../service/app-search.service';
@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('quickSearch') quickSearchEl: QuickSearchComponent;
  // application wide search query
  appQuery: SearchQuery;
  aggs: ObjectTypeAggregation[];
  disableFileDrop: boolean;
  @HostBinding('class.aggregations') hasAggs: boolean;

  reloadComponent = true;

  constructor(
    private router: Router,
    private userService: UserService,
    private frameService: FrameService,
    private appSearch: AppSearchService,
    private eventService: EventService,
    private titleService: Title
  ) {
    this.userService.user$.subscribe((user: YuvUser) => {
      if (user) {
        this.disableFileDrop = !user.authorities.includes(UserRoles.CREATE_OBJECT);
      }
    });
    this.eventService.on(YuvEventType.CLIENT_LOCALE_CHANGED).subscribe(() => {
      this.reloadComponent = false;
      setTimeout(() => (this.reloadComponent = true), 1);
    });
  }

  onShowAll(q: SearchQuery) {
    this.onQuickSearchQuery(q, true);
  }

  onFilesDropped(files: File[]) {
    this.frameService.createObject(null, files);
  }

  onRecentItemClicked(recentItem: RecentItem) {
    Utils.navigate(recentItem.newTab, this.router, ['object', recentItem.objectId]);
  }

  async onQuickSearchQuery(query: SearchQuery, preventAppSearchSet: boolean = false) {
    const navigationExtras: NavigationExtras = { queryParams: { query: JSON.stringify(query.toQueryJson()) } };
    await this.router.navigate(['/result'], navigationExtras);
    if (!preventAppSearchSet) {
      this.appSearch.setQuery(query);
    }
  }

  onQuickSearchReset() {
    this.appSearch.setQuery(new SearchQuery());
  }

  onTypeAggregation(aggs: ObjectTypeAggregation[]) {
    this.aggs = aggs;
    this.hasAggs = aggs && aggs.length > 0;
  }

  applyAggregation(agg: ObjectTypeAggregation) {
    this.quickSearchEl?.applyTypeAggration(agg, true);
  }

  ngOnInit() {
    this.titleService.setTitle(APP_VARS.defaultPageTitle);
    this.appQuery = new SearchQuery();
  }
}
