import { Component, HostBinding, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { EventService, SearchQuery, SystemService, UserService, Utils, YuvEventType, YuvUser } from '@yuuvis/core';
import { GroupedSelectComponent, ObjectTypeAggregation, QuickSearchComponent, RecentItem, Selectable, SelectableGroup } from '@yuuvis/framework';
import { FrameService } from '../../components/frame/frame.service';
import { AppSearchService } from '../../service/app-search.service';
@Component({
  selector: 'yuv-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('quickSearch') quickSearchEl: QuickSearchComponent;
  @ViewChild('aggs') aggsEl: GroupedSelectComponent;
  // application wide search query
  appQuery: SearchQuery;
  aggs: ObjectTypeAggregation[];
  aggsGroups: SelectableGroup[];
  disableFileDrop: boolean;
  @HostBinding('class.aggregations') hasAggs: boolean;

  reloadComponent = true;

  @HostListener('keydown.ArrowDown', ['$event']) onKeyDown(event) {
    if (!event.defaultPrevented && this.aggsEl) {
      this.aggsEl.focus();
      return false;
    }
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private frameService: FrameService,
    private appSearch: AppSearchService,
    private eventService: EventService,
    private systemService: SystemService
  ) {
    this.userService.user$.subscribe((user: YuvUser) => {
      if (user) {
        this.disableFileDrop = !this.userService.canCreateObjects;
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
    this.aggsGroups = [
      {
        id: 'aggs',
        label: '',
        items: (this.aggs || []).map((a) => ({
          id: a.objectTypeId,
          label: a.label || a.objectTypeId,
          svgSrc: this.systemService.getObjectTypeIconUri(a.objectTypeId),
          count: a.count,
          value: a
        }))
      }
    ];
  }

  applyAggregation(item: Selectable) {
    this.quickSearchEl?.applyTypeAggration(item.value as ObjectTypeAggregation, true);
  }

  ngOnInit() {
    this.appQuery = new SearchQuery();
  }
}
