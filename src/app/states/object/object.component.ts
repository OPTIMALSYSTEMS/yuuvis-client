import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AppCacheService,
  BaseObjectTypeField,
  DmsObject,
  DmsService,
  EventService,
  SearchFilter,
  SearchQuery,
  TranslateService,
  YuvEventType
} from '@yuuvis/core';
import { LayoutService } from '@yuuvis/framework';
import { tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-object',
  templateUrl: './object.component.html',
  styleUrls: ['./object.component.scss'],
  host: {
    class: 'state-content-default'
  }
})
export class ObjectComponent implements OnInit, OnDestroy {
  private STORAGE_KEY = 'yuv.app.object';

  contextBusy: boolean;
  contextError: string;
  activeTabIndex: number;
  context: DmsObject;
  selectedItem: string;
  recentItems: string[] = [];
  contextChildrenQuery: SearchQuery;
  recentItemsQuery: SearchQuery;
  contextSearchQuery: SearchQuery;

  private options = {
    'yuv-responsive-master-slave': { useStateLayout: true },
    'yuv-object-details': null,
    'yuv-search-result-all': null,
    'yuv-search-result-recent': null
  };

  constructor(
    private route: ActivatedRoute,
    private dmsService: DmsService,
    private translate: TranslateService,
    private title: Title,
    private router: Router,
    private layoutService: LayoutService,
    private eventService: EventService,
    private appCacheService: AppCacheService
  ) {}

  onOptionsChanged(options: any, component: string) {
    this.options[component] = options;
    // this.appCacheService.setItem(this.getStorageKey(), this.options).subscribe();
    this.layoutService.saveComponentLayout(this.getOptionsStorageKey(), this.options).subscribe();
  }

  getOptions(component: string) {
    return this.options[component];
  }

  private getOptionsStorageKey() {
    return this.STORAGE_KEY;
  }

  private getRecentItemsStorageKey() {
    return this.context ? `${this.STORAGE_KEY}.${this.context.id}` : this.STORAGE_KEY;
  }

  private setupSelectedItem(id) {
    this.selectedItem = id;
    this.addRecentItem(id);
  }

  private loadRecentItems() {
    this.appCacheService.getItem(this.getRecentItemsStorageKey()).subscribe(items => {
      this.recentItems = items || [];
      this.setupRecentItemsQuery();
    });
  }

  private addRecentItem(id) {
    this.recentItems = this.recentItems.filter(i => i !== id);
    this.recentItems.push(id);
    this.setupRecentItemsQuery();
    if (this.context) {
      this.appCacheService.setItem(this.getRecentItemsStorageKey(), this.recentItems).subscribe();
    }
  }

  private setupRecentItemsQuery() {
    // TODO: Only set up new query if the items actually changed
    const q = new SearchQuery();
    q.addFilter(new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.IN, this.recentItems.reverse()));
    this.recentItemsQuery = q;
  }

  private setupContext(contextID: string) {
    this.contextBusy = true;
    this.dmsService
      .getDmsObject(contextID)
      .pipe(
        tap((res: DmsObject) => {
          this.context = res;
          this.title.setTitle(this.context.title);
          this.loadRecentItems();
          const q = new SearchQuery();
          q.addFilter(new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, this.context.id));
          // by default result will be sorted by modification date, in order to always retrieve items that
          // were modified/created recently first
          q.sortOptions = [
            {
              field: BaseObjectTypeField.MODIFICATION_DATE,
              order: 'asc'
            }
          ];
          this.contextChildrenQuery = q;
        })
      )
      .subscribe(
        _ => {
          this.contextBusy = false;
        },
        err => {
          this.contextBusy = false;
          this.contextError = this.translate.instant('yuv.client.state.object.context.load.error');
        }
      );
  }

  select(ids: string[]) {
    if (ids && ids.length === 1) {
      this.router.navigate(['.'], { fragment: ids[0], replaceUrl: !!this.selectedItem, relativeTo: this.route, queryParamsHandling: 'preserve' });
    }
  }

  ngOnInit() {
    this.layoutService.loadComponentLayout(this.getOptionsStorageKey()).subscribe(o => (this.options = { ...this.options, ...o }));
    this.route.params.pipe(takeUntilDestroy(this)).subscribe((params: any) => {
      if (params.id) {
        this.setupContext(params.id);
      }
    });
    // query params may provide a query to be executed within this state
    this.route.queryParams.pipe(takeUntilDestroy(this)).subscribe((queryParams: any) => {
      this.contextSearchQuery = !!queryParams.query ? new SearchQuery(JSON.parse(queryParams.query)) : null;
      this.activeTabIndex = !!this.contextSearchQuery ? 2 : 0;
    });
    // fragments are used to identify the selected item within the context
    this.route.fragment.pipe(takeUntilDestroy(this)).subscribe((fragment: any) => {
      this.setupSelectedItem(fragment);
    });

    this.eventService
      .on(YuvEventType.DMS_OBJECT_DELETED)
      .pipe(takeUntilDestroy(this))
      .subscribe(event => {
        if (this.context.id === event.data.id) {
          this.router.navigate(['/']);
        }
      });
  }

  ngOnDestroy() {}
}
