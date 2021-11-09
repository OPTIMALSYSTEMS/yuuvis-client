import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppCacheService, DmsObject, DmsService, EventService, SearchQuery, TranslateService, YuvEventType } from '@yuuvis/core';
import { ContextComponent, PluginsService } from '@yuuvis/framework';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { FrameService } from '../../components/frame/frame.service';
import { AppSearchService } from '../../service/app-search.service';

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
  private standaloneFragment = 'standalone';

  @ViewChild('yuvContext', { static: true }) yuvContextCmp: ContextComponent;

  contextBusy: boolean;
  contextError: string;
  context: DmsObject;
  selectedItem: string;
  // ID of the object that should be shown standalone (have no context)
  _standalone: string;
  recentItems: string[] = [];
  contextSearchQuery: SearchQuery;
  private contextId: string;

  plugins: any;
  pluginsContext: any;

  constructor(
    private route: ActivatedRoute,
    private dmsService: DmsService,
    private appSearch: AppSearchService,
    private translate: TranslateService,
    private titleService: Title,
    private frameService: FrameService,
    private router: Router,
    private eventService: EventService,
    private appCacheService: AppCacheService,
    private pluginsService: PluginsService
  ) {
    this.plugins = this.pluginsService.getCustomPlugins('extensions', 'yuv-object');
    this.pluginsContext = this.pluginsService.getCustomPlugins('extensions', 'yuv-object-context');
  }

  onContextFilesDropped(files: File[]) {
    this.frameService.createObject(this.contextId, files);
  }

  objectDetailsVersionClicked(version: number) {
    console.log(version);
  }

  contextItemsSelected(ids: string[]) {
    if (ids && ids.length === 0) {
      ids = [this.contextId];
    }
    if (ids && ids.length === 1) {
      this.router.navigate(['.'], { fragment: ids[0], replaceUrl: !!this.selectedItem, relativeTo: this.route, queryParamsHandling: 'preserve' });
      this.addRecentItem(ids[0]);
    }
  }

  private getRecentItemsStorageKey() {
    return this.context ? `${this.layoutOptionsStorageKey}.${this.contextId}` : this.layoutOptionsStorageKey;
  }

  private setupSelectedItem(id) {
    this.selectedItem = id;
    this.addRecentItem(id);
  }

  private loadRecentItems() {
    this.appCacheService.getItem(this.getRecentItemsStorageKey()).subscribe((items) => (this.recentItems = items && Array.isArray(items) ? items : []));
  }

  private addRecentItem(id: string) {
    if (id !== this.contextId) {
      /* tslint:disable:tslint no-unused-expression */
      !this.recentItems.includes(id) && this.recentItems.push(id);
    }
    if (this.context) {
      this.appCacheService.setItem(this.getRecentItemsStorageKey(), this.recentItems).subscribe();
    }
  }

  private redirect(id: string, fragment: string) {
    this.router.navigate(['/object', id], { fragment, replaceUrl: true });
  }

  private setupContext(contextID: string) {
    this.contextBusy = true;
    this.dmsService
      .getDmsObject(contextID)
      .pipe(finalize(() => (this.contextBusy = false)))
      .subscribe(
        (dmsObject: DmsObject) => {
          if (!dmsObject) {
            return;
          } else if (!dmsObject?.isFolder) {
            if (dmsObject?.parentId) {
              // got object from within a context, so we'll go there instead
              this.redirect(dmsObject.parentId, dmsObject.id);
            } else {
              // got object that is just an object without context
              this.redirect(dmsObject.id, this.standaloneFragment);
              this.titleService.setTitle(dmsObject.title);
            }
          } else {
            // TODO: shouldn't context be set always? @anndreasSchulz
            this.context = dmsObject;
            this.titleService.setTitle(this.context.title);
            this.loadRecentItems();
          }
        },
        (error) => (this.contextError = this.translate.instant('yuv.framework.object-details.context.load.error'))
      );
  }

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroy(this)).subscribe((params: any) => {
      if (params.id) {
        // saving context ID in its own var, so while the dms object is loading
        // we are able to properly set the selected item when there is no fragment ist available.
        this.contextId = params.id;
        this.setupContext(params.id);
      }
    });
    // query params may provide a query to be executed within this state
    this.route.queryParams.pipe(takeUntilDestroy(this)).subscribe((queryParams: any) => {
      this.contextSearchQuery = !!queryParams.query ? new SearchQuery(JSON.parse(queryParams.query)) : null;
      this.appSearch.setQuery(this.contextSearchQuery);
    });
    // fragments are used to identify the selected item within the context
    this.route.fragment.pipe(takeUntilDestroy(this)).subscribe((fragment: any) => {
      this._standalone = fragment === this.standaloneFragment ? this.contextId : null;
      if (!this._standalone) {
        this.setupSelectedItem(fragment || this.contextId);
      }
    });

    this.eventService
      .on(YuvEventType.DMS_OBJECT_DELETED)
      .pipe(takeUntilDestroy(this))
      .subscribe((event) => {
        if (this.route.snapshot.fragment && this.route.snapshot.fragment === event.data?.id) {
          // get rid of the fragment once the deleted item has the same ID
          this.router.navigate([]);
        }
        if (this.context?.id === event.data.id || this.contextId === event.data.id) {
          this.router.navigate(['/']);
        }
      });
  }

  ngOnDestroy() {}
}
