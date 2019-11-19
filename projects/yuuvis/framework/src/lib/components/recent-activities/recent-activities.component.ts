import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import {
  BaseObjectTypeField,
  SearchFilter,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchService,
  SecondaryObjectTypeField,
  SortOption,
  SystemService,
  UserService,
  YuvUser
} from '@yuuvis/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Component showing recent activities for the current user. This means listing the objects
 * that has been recently created or modified by the user. You may disable created or modified
 * list by setting the related input parameter to `false`.
 *
 * There are some css classes that affect the look and feel of the component.
 * `<yuv-recent-activities class="transparent">` Transparent background
 * `<yuv-recent-activities class="flipped">` Flip controls to be on the bottom instaed of on the top
 */
@Component({
  selector: 'yuv-recent-activities',
  templateUrl: './recent-activities.component.html',
  styleUrls: ['./recent-activities.component.scss']
})
export class RecentActivitiesComponent implements OnInit {
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

  constructor(private userService: UserService, private systemService: SystemService, private searchService: SearchService) {}

  private getCreated(userId: string) {
    this.createdQuery = new SearchQuery();
    this.createdQuery.addFilter(new SearchFilter(BaseObjectTypeField.CREATED_BY, SearchFilter.OPERATOR.EQUAL, userId));
    this.createdQuery.sortOptions = [new SortOption(BaseObjectTypeField.CREATION_DATE, 'desc')];
    this.createdQuery.size = this.size;
    this.fetchItems(this.createdQuery).subscribe((res: SearchResult) => {
      this.recentlyCreated = res.items.map(i => this.toRecentItem(i, i.fields.get(BaseObjectTypeField.CREATION_DATE)));
    });
  }
  private getModified(userId: string) {
    this.modifiedQuery = new SearchQuery();
    this.modifiedQuery.addFilter(new SearchFilter(BaseObjectTypeField.MODIFIED_BY, SearchFilter.OPERATOR.EQUAL, userId));
    this.modifiedQuery.sortOptions = [new SortOption(BaseObjectTypeField.MODIFICATION_DATE, 'desc')];
    this.modifiedQuery.size = this.size;
    this.fetchItems(this.modifiedQuery).subscribe((res: SearchResult) => {
      this.recentlyModified = res.items.map(i => this.toRecentItem(i, i.fields.get(BaseObjectTypeField.MODIFICATION_DATE)));
    });
  }

  private fetchItems(query: SearchQuery): Observable<SearchResult> {
    this.fetchError = false;

    return this.searchService.search(query).pipe(
      catchError(e => {
        this.fetchError = true;
        return throwError(e);
      })
    );
  }

  private toRecentItem(resItem: SearchResultItem, date: Date): RecentItem {
    const objectTypeId = resItem.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID);
    return {
      title: resItem.fields.get(SecondaryObjectTypeField.TITLE),
      description: resItem.fields.get(SecondaryObjectTypeField.DESCRIPTION),
      objectId: resItem.fields.get(BaseObjectTypeField.OBJECT_ID),
      objectTypeId: objectTypeId,
      objectTypeIcon: this.systemService.getObjectTypeIcon(objectTypeId),
      date: date
    };
  }

  select(tab: 'created' | 'modified') {
    this.selected = tab;
  }

  triggerShowAll() {
    const query = this.selected === 'created' ? this.createdQuery : this.modifiedQuery;
    if (query) {
      // remove size from list to fall back to the default
      query.size = null;
      this.showAll.emit(query);
    }
  }

  triggerItemClicked(item: RecentItem) {
    this.itemClick.emit(item);
  }

  ngOnInit() {
    this.userService.user$.subscribe((user: YuvUser) => {
      if (user) {
        if (this.created) {
          this.getCreated(user.id);
        }
        if (this.modified) {
          this.getModified(user.id);
        }
        if (this.modified && !this.created) {
          this.selected = 'modified';
        }
        this.isTabbed = this.created && this.modified;
        this.hasAnyItems = (this.recentlyCreated && this.recentlyCreated.length > 0) || (this.recentlyModified && this.recentlyModified.length > 0);
      }
    });
  }
}

export interface RecentItem {
  title: string;
  description: string;
  objectId: string;
  objectTypeId: string;
  objectTypeIcon: string;
  date: Date;
}
