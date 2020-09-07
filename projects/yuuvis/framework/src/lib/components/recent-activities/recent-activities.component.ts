import { Attribute, Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import {
  AppCacheService,
  BaseObjectTypeField,
  ClientDefaultsObjectTypeField,
  SearchFilter,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchService,
  SortOption,
  SystemService,
  UserService,
  YuvUser
} from '@yuuvis/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Component showing recent activities for the current user. This means listing the objects
 * that has been recently created or modified by the user. You may disable created or modified
 * list by setting the related input parameter to `false`.
 *
 * There are some css classes that affect the look and feel of the component.
 * `<yuv-recent-activities class="transparent">` Transparent background
 * `<yuv-recent-activities class="flipped">` Flip controls to be on the bottom instaed of on the top.
 *
 * If the component has an `id` attribute, the state of the component will be persisted. So make sure
 * to set up unique ids if you are using this component on more than one place within your application.
 * 
 * [Screenshot](../assets/images/yuv-recent-activities.gif)
 * 
 * @example
 *  <yuv-recent-activities id="some-id" (itemClick)="onItemClicked($event)" (showAll)="onShowAll($event)">
  </yuv-recent-activities>
 */
@Component({
  selector: 'yuv-recent-activities',
  templateUrl: './recent-activities.component.html',
  styleUrls: ['./recent-activities.component.scss']
})
export class RecentActivitiesComponent implements OnInit {
  private cacheKeyBase = 'yuv.framework.recent-activities';
  isLoading = false;
  /**
   * Data to be displayed by the component. If not provided, recent items will be
   * fetched for the current user. This may come in handy if you want to display
   * recent activities for another user.
   *
   * Setting this will ignore all other inputs.
   */
  @Input() data: RecentActivitiesData;
  /**
   * Whether or not to show recently created items (default: true)
   */
  @Input() created: boolean = true;
  /**
   * Whether or not to show recently modified items (default: true)
   */
  @Input() modified: boolean = true;
  /**
   * Number of items to fetch for each list
   */
  @Input() size: number = 10;
  /**
   * Emitted once the user decides to show all items for a list (created/modified).
   * Will emit a `SeachQuery` that then could be executed from an outside component.
   */
  @Output() showAll = new EventEmitter<SearchQuery>();
  /**
   * Emitted when a list item was clicked
   */
  @Output() itemClick = new EventEmitter<RecentItem>();

  @HostBinding('class.tabbed') isTabbed: boolean;
  @HostBinding('class.error') fetchError: boolean;

  recentlyCreated: RecentItem[];
  recentlyModified: RecentItem[];
  hasAnyItems: boolean;
  selected: 'created' | 'modified' = 'created';
  createdQuery: SearchQuery;
  modifiedQuery: SearchQuery;

  constructor(
    @Attribute('id') public id: string,
    private userService: UserService,
    private appCache: AppCacheService,
    private systemService: SystemService,
    private searchService: SearchService
  ) {
    if (this.id) {
      this.appCache.getItem(`${this.cacheKeyBase}.${this.id}`).subscribe((res) => {
        if (res && res.selected) {
          this.selected = res.selected;
        }
      });
    }
  }

  private getCreated(userId: string) {
    this.createdQuery = new SearchQuery();
    this.createdQuery.addFilter(new SearchFilter(BaseObjectTypeField.CREATED_BY, SearchFilter.OPERATOR.EQUAL, userId));
    this.createdQuery.sortOptions = [new SortOption(BaseObjectTypeField.CREATION_DATE, 'desc')];
    this.createdQuery.size = this.size;
    this.fetchItems(this.createdQuery).subscribe((res: SearchResult) => {
      this.recentlyCreated = res.items.map((i) => this.toRecentItem(i, i.fields.get(BaseObjectTypeField.CREATION_DATE)));
    });
  }
  private getModified(userId: string) {
    this.modifiedQuery = new SearchQuery();
    this.modifiedQuery.addFilter(new SearchFilter(BaseObjectTypeField.MODIFIED_BY, SearchFilter.OPERATOR.EQUAL, userId));
    this.modifiedQuery.sortOptions = [new SortOption(BaseObjectTypeField.MODIFICATION_DATE, 'desc')];
    this.modifiedQuery.size = this.size;
    this.fetchItems(this.modifiedQuery).subscribe((res: SearchResult) => {
      this.recentlyModified = res.items.map((i) => this.toRecentItem(i, i.fields.get(BaseObjectTypeField.MODIFICATION_DATE)));
    });
  }

  private fetchItems(query: SearchQuery): Observable<SearchResult> {
    this.fetchError = false;
    this.isLoading = true;
    return this.searchService.search(query).pipe(
      tap(() => (this.isLoading = false)),
      catchError((e) => {
        this.fetchError = true;
        return throwError(e);
      })
    );
  }

  private toRecentItem(resItem: SearchResultItem, date: Date): RecentItem {
    const objectTypeId = this.systemService.getLeadingObjectTypeID(
      resItem.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID),
      resItem.fields.get(BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS)
    );

    return {
      title: resItem.fields.get(ClientDefaultsObjectTypeField.TITLE),
      description: resItem.fields.get(ClientDefaultsObjectTypeField.DESCRIPTION),
      objectId: resItem.fields.get(BaseObjectTypeField.OBJECT_ID),
      objectTypeId,
      // objectTypeIconHTML: CellRenderer.typeCellRenderer({
      //   value: objectTypeId,
      //   context: {
      //     system: this.systemService
      //   }
      // }),
      objectTypeLabel: this.systemService.getLocalizedResource(`${objectTypeId}_label`),
      date
    };
  }

  select(tab: 'created' | 'modified') {
    this.selected = tab;
    if (this.id) {
      this.appCache
        .setItem(`${this.cacheKeyBase}.${this.id}`, {
          selected: this.selected
        })
        .subscribe();
    }
  }

  triggerShowAll() {
    const query = this.selected === 'created' ? this.createdQuery : this.modifiedQuery;
    if (query) {
      // remove size from list to fall back to the default
      query.size = null;
      this.showAll.emit(query);
    }
  }

  triggerItemClicked(item: RecentItem, event: MouseEvent) {
    this.itemClick.emit({ ...item, newTab: event.ctrlKey });
  }

  private postFetch() {
    if ((this.modified && !this.created) || (this.recentlyCreated && this.recentlyCreated.length === 0)) {
      this.selected = 'modified';
    }
    this.isTabbed = this.created && this.modified;
    this.hasAnyItems = (this.recentlyCreated && this.recentlyCreated.length > 0) || (this.recentlyModified && this.recentlyModified.length > 0);
  }

  ngOnInit() {
    if (this.data) {
      if (this.data.modified) {
        this.modified = true;
        this.recentlyModified = this.data.modified;
      }
      if (this.data.modified) {
        this.created = true;
        this.recentlyCreated = this.data.created;
      }
      this.postFetch();
    } else {
      this.userService.user$.subscribe((user: YuvUser) => {
        if (user) {
          if (this.created) {
            this.getCreated(user.id);
          }
          if (this.modified) {
            this.getModified(user.id);
          }
          this.postFetch();
        }
      });
    }
  }
}
/**
 * Input data for the `RecentActivitiesComponent`
 */
export interface RecentActivitiesData {
  /**
   * List of objects that have been resently created
   */
  created: RecentItem[];
  /**
   * List of objects that have been resently modified
   */
  modified: RecentItem[];
}

/**
 * Object, that has been resently changed
 */
export interface RecentItem {
  title: string;
  description: string;
  objectId: string;
  objectTypeId: string;
  // objectTypeIconHTML: string;
  objectTypeLabel: string;
  /**
   * date of object
   */
  date: Date;
  /** wether or nor will be opended in a new tab*/
  newTab?: boolean;
}
