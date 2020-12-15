import { Component, HostBinding, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import {
  AuthService,
  BaseObjectTypeField,
  ConnectionService,
  ConnectionState,
  DmsService,
  EventService,
  ObjectTag,
  SearchFilter,
  SearchQuery,
  TranslateService,
  UserRoles,
  UserService,
  YuvEventType,
  YuvUser
} from '@yuuvis/core';
import {
  IconRegistryService,
  LayoutService,
  LayoutSettings,
  openContext,
  PluginGuard,
  PluginsService,
  PopoverRef,
  PopoverService,
  Screen,
  ScreenService,
  UploadResult
} from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { add, close, drawer, offline, refresh, search, userDisabled } from '../../../assets/default/svg/svg';
import { AppSearchService } from '../../service/app-search.service';
import { FrameService } from './frame.service';

@Component({
  selector: 'yuv-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit, OnDestroy {
  @ViewChild('moveNotification') moveNotification: TemplateRef<any>;

  // query for fetching pending AFOs
  pendingAFOsQuery = JSON.stringify({
    tags: [
      {
        name: ObjectTag.AFO,
        filters: {
          filters: [
            {
              f: 'state',
              o: SearchFilter.OPERATOR.EQUAL,
              v1: '0'
            }
          ]
        }
      }
    ]
  });

  swUpdateAvailable: boolean;
  hideAppBar: boolean;
  disableFileDrop: boolean;
  disableCreate: boolean;
  displaySideBar: boolean;
  screenSmall: boolean;
  user: YuvUser;
  disabledContextSearch: boolean;
  appQuery: SearchQuery;

  navigationPlugins: Observable<any[]>;
  settingsPlugins: Observable<any[]>;

  context: string;
  reloadComponent = true;

  @HostListener('window:dragover', ['$event']) onDragOver(e) {
    if (!e.dataTransfer) {
      return;
    }
    e.dataTransfer.dropEffect = 'none';
    e.preventDefault();
  }
  @HostListener('window:drop', ['$event']) onDrop(e) {
    e.preventDefault();
  }

  // tslint:disable-next-line: member-ordering
  @HostBinding('class.transparentAppBar') tab: boolean;
  // tslint:disable-next-line: member-ordering
  @HostBinding('class.offline') isOffline: boolean;

  constructor(
    private router: Router,
    private frameService: FrameService,
    private route: ActivatedRoute,
    private layoutService: LayoutService,
    private update: SwUpdate,
    private appSearch: AppSearchService,
    private connectionService: ConnectionService,
    private authService: AuthService,
    private screenService: ScreenService,
    private userService: UserService,
    private eventService: EventService,
    private translateService: TranslateService,
    private popoverService: PopoverService,
    private dmsService: DmsService,
    private iconRegistry: IconRegistryService,
    private pluginsService: PluginsService
  ) {
    this.pluginsService.getViewerPlugins('states').subscribe((states) => PluginGuard.updateRouter(router, states));
    this.navigationPlugins = this.pluginsService.getViewerPlugins('links', 'yuv-sidebar-navigation');
    this.settingsPlugins = this.pluginsService.getViewerPlugins('links', 'yuv-sidebar-settings');

    this.iconRegistry.registerIcons([search, drawer, refresh, add, userDisabled, offline, close, openContext]);
    this.userService.user$.subscribe((user: YuvUser) => {
      this.user = user;
      if (user) {
        this.disableCreate = !user.authorities.includes(UserRoles.CREATE_OBJECT);
        if (this.disableCreate) {
          this.disableFileDrop = true;
        }
      }
    });
    this.update.available.subscribe((update) => (this.swUpdateAvailable = true));
    this.layoutService.layoutSettings$.subscribe((settings: LayoutSettings) => this.applyLayoutSettings(settings));
    this.connectionService.connection$.subscribe((connectionState: ConnectionState) => {
      this.isOffline = !connectionState.isOnline;
    });
    this.screenService.screenChange$.subscribe((s: Screen) => {
      this.screenSmall = s.isSmall;
    });
    this.eventService
      .on(YuvEventType.DMS_OBJECTS_MOVED)
      .pipe(takeUntilDestroy(this))
      .subscribe((event) => this.onObjetcsMove(event));

    this.eventService.on(YuvEventType.CLIENT_LOCALE_CHANGED).subscribe(() => {
      this.reloadComponent = false;
      setTimeout(() => (this.reloadComponent = true), 1);
    });
  }

  onObjetcsMove(event) {
    const popoverConfig = {
      maxHeight: '70%',
      width: 300,
      bottom: 16,
      right: 16,
      duration: 10,
      data: {
        title: this.translateService.instant('yuv.client.frame.move.notification.title.root'),
        newParent: null,
        succeeded: event.data.succeeded,
        failed: event.data.failed
      },
      panelClass: 'move-notification'
    };
    if (event.data.targetFolderId) {
      this.dmsService.getDmsObject(event.data.targetFolderId).subscribe((newParent) => {
        popoverConfig.data.title = this.translateService.instant('yuv.client.frame.move.notification.title', { objectTitle: newParent.title });
        popoverConfig.data.newParent = newParent;
        this.popoverService.open(this.moveNotification, popoverConfig);
      });
    } else {
      this.popoverService.open(this.moveNotification, popoverConfig);
    }
  }

  showSideBar(display = true) {
    setTimeout(() => (this.displaySideBar = display));
  }

  closeNotification(popoverRef?: PopoverRef) {
    if (popoverRef) {
      popoverRef.close();
    }
  }

  get currentRoute() {
    return this.router.url.substr(1);
  }

  private applyLayoutSettings(settings: LayoutSettings) {
    const body = document.getElementsByTagName('body')[0];
    const acProperty = '--color-accent-rgb';
    if (settings.accentColor) {
      document.documentElement.style.setProperty(acProperty, settings.accentColor);
    } else {
      document.documentElement.style.removeProperty(acProperty);
    }

    const dbProperty = '--theme-background';
    if (settings.dashboardBackground) {
      body.style.setProperty(dbProperty, 'url("' + settings.dashboardBackground + '")', 'important');
    } else {
      body.style.removeProperty(dbProperty);
    }
  }

  reload() {
    location.reload();
  }

  logout(event: MouseEvent) {
    event.preventDefault();
    this.userService.logout();
  }

  navigate(state: string) {
    if (this.currentRoute !== state) {
      this.showSideBar(false);
      this.router.navigate([state]);
    }
  }

  onQuickSearchToggleContextSearch(on: boolean) {
    this.disabledContextSearch = on;
  }

  onFilesDropped(files: File[]) {
    this.frameService.createObject(null, files);
  }

  async onQuickSearchQuery(query: SearchQuery) {
    // As app bar search is available anywhere inside the app, searches will be
    // set up to the global app search in order to be persisted through states.
    // On the other hand, there are some states that enable search within a context.
    // Those queries will NOT be set to the global app search service, because you
    // wouldn't be able to get rid of the context anywhere else.
    const withinContext = query.getFilter(BaseObjectTypeField.PARENT_ID) ? query.getFilter(BaseObjectTypeField.PARENT_ID).firstValue : null;
    const navigationExtras: NavigationExtras = { queryParams: { query: JSON.stringify(query.toQueryJson()) } };
    // Being within a context does not mean that the query is restricted to this
    // context (user decides). So we have to check based on the provided filters
    if (withinContext) {
      // this.contextQuery = query;
      await this.router.navigate([], {
        relativeTo: this.route,
        // replace url if there was a former search already
        replaceUrl: !!this.route.snapshot.paramMap.get('query'),
        preserveFragment: true,
        ...navigationExtras
      });
    } else {
      this.appSearch.setQuery(query);
      await this.router.navigate(['/result'], navigationExtras);
    }
  }

  updateWorker() {
    this.update.activateUpdate().then(() => document.location.reload());
  }

  onResultItemClick(res: UploadResult) {
    if (Array.isArray(res.objectId)) {
      const searchQuery = new SearchQuery();
      searchQuery.addFilter(new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.IN, res.objectId));
      this.router.navigate(['/result'], {
        queryParams: {
          query: JSON.stringify(searchQuery.toQueryJson()),
          tmp: true
        }
      });
    } else {
      this.router.navigate(['/object', res.objectId]);
    }
  }

  private getContextFromURL(url: string) {
    const contextUriPrefix = '/object/';
    // getting a #standalone fragment means that we got an object without context
    if (url.startsWith(contextUriPrefix) && url.indexOf('#standalone') === -1) {
      const ctx = url.match(/\/object\/([^#?]+)/)[1];
      if (ctx && ctx !== this.context) {
        this.context = ctx;
      }
    } else {
      // Comming from a context, we'll reset to a new app wide query.
      // Because, the search that has been created within the context
      // makes no sense for the dashboard
      if (this.context) {
        this.appSearch.setQuery(new SearchQuery());
      }
      this.context = null;
    }
  }

  ngOnInit() {
    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      if (!authenticated) {
        const tenant = this.authService.getTenant();
        if (tenant) {
          (window as any).location.href = `/oauth/${tenant}`;
        }
      }
    });
    this.appSearch.query$.subscribe((q: SearchQuery) => {
      this.appQuery = q;
    });
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.getContextFromURL(e.urlAfterRedirects);
      // transparent app-bar?
      this.tab = e.urlAfterRedirects.startsWith('/dashboard');
      // disable fileDrop being on create state
      this.disableFileDrop = this.disableCreate || e.urlAfterRedirects.startsWith('/create');
    });
  }

  ngOnDestroy() {}
}
