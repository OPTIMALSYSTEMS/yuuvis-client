import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppCacheService, DmsObject, DmsService, EventService, SearchQuery, TranslateService, YuvEventType } from '@yuuvis/core';
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
  layoutOptionsStorageKey = 'yuv.app.object';

  contextBusy: boolean;
  contextError: string;
  context: DmsObject;
  selectedItem: string;
  recentItems: string[] = [];
  contextSearchQuery: SearchQuery;

  constructor(
    private route: ActivatedRoute,
    private dmsService: DmsService,
    private translate: TranslateService,
    private title: Title,
    private router: Router,
    private eventService: EventService,
    private appCacheService: AppCacheService
  ) {}

  contextItemsSelected(ids: string[]) {
    if (ids && ids.length === 1) {
      this.router.navigate(['.'], { fragment: ids[0], replaceUrl: !!this.selectedItem, relativeTo: this.route, queryParamsHandling: 'preserve' });
      this.addRecentItem(ids[0]);
    }
  }

  private getRecentItemsStorageKey() {
    return this.context ? `${this.layoutOptionsStorageKey}.${this.context.id}` : this.layoutOptionsStorageKey;
  }

  private setupSelectedItem(id) {
    this.selectedItem = id;
    this.addRecentItem(id);
  }

  private loadRecentItems() {
    this.appCacheService.getItem(this.getRecentItemsStorageKey()).subscribe(items => {
      this.recentItems = items || [];
    });
  }

  private addRecentItem(id: string) {
    this.recentItems = this.recentItems.filter(i => i !== id);
    this.recentItems.push(id);
    if (this.context) {
      this.appCacheService.setItem(this.getRecentItemsStorageKey(), this.recentItems).subscribe();
    }
  }

  private setupContext(contextID: string) {
    this.contextBusy = true;
    this.dmsService.getDmsObject(contextID).subscribe(
      (dmsObject: DmsObject) => {
        if (!dmsObject.isFolder) {
          if (dmsObject.parentId) {
            // got object from within a context, so we'll go there instead
            this.router.navigate(['', dmsObject.parentId], {
              fragment: dmsObject.id,
              relativeTo: this.route,
              replaceUrl: true
            });
          } else {
            // got object that is just an object without context
            this.router.navigate([''], {
              fragment: 'standalone',
              relativeTo: this.route,
              replaceUrl: true
            });
          }
        } else {
          this.context = dmsObject;
          this.title.setTitle(this.context.title);
          this.loadRecentItems();
        }
        this.contextBusy = false;
      },
      err => {
        this.contextBusy = false;
        this.contextError = this.translate.instant('yuv.client.state.object.context.load.error');
      }
    );
  }

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroy(this)).subscribe((params: any) => {
      if (params.id) {
        this.setupContext(params.id);
      }
    });
    // query params may provide a query to be executed within this state
    this.route.queryParams.pipe(takeUntilDestroy(this)).subscribe((queryParams: any) => {
      this.contextSearchQuery = !!queryParams.query ? new SearchQuery(JSON.parse(queryParams.query)) : null;
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
