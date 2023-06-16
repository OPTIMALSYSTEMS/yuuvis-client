import { Component, HostBinding, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router, RoutesRecognized } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import {
  AuthService,
  BackendService,
  BaseObjectTypeField,
  ConnectionService,
  ConnectionState,
  DmsService,
  EventService,
  SearchFilter,
  SearchQuery,
  TranslateService,
  UserRoles,
  UserService,
  Utils,
  YuvEventType,
  YuvUser
} from '@yuuvis/core';
import {
  help,
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
import { forkJoin, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { add, close, drawer, offline, refresh, search, userDisabled } from '../../../assets/default/svg/svg';
import { AppSearchService } from '../../service/app-search.service';
import { AboutService } from '../../states/about/service/about.service';
import { FrameService } from './frame.service';

@UntilDestroy()
@Component({
  selector: 'yuv-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit, OnDestroy {
  private LAYOUT_OPTIONS_KEY = 'yuv.client.yuv-frame';
  private LAYOUT_OPTIONS_ELEMENT_KEY = 'yuv-frame';
  @ViewChild('moveNotification') moveNotification: TemplateRef<any>;

  moveNoticeDialogSkip: boolean;
  swUpdateAvailable: boolean;
  hideAppBar: boolean;
  disableFileDrop: boolean;
  disableCreate: boolean;
  checkedForLogoutRoute: boolean;
  enableTenantSwitch: boolean;
  displaySideBar: boolean;
  screenSmall: boolean;
  user: YuvUser;
  disabledContextSearch: boolean;
  appQuery: SearchQuery;

  navigationPlugins: Observable<any[]>;
  settingsPlugins: Observable<any[]>;

  pendingAFOsQuery = this.frameService.pendingAFOsQuery;
  sidebarShowRetentions: boolean;

  context: string;
  reloadComponent = true;
  initError: string;
  docuLink: string;
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

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @HostBinding('class.transparentAppBar') tab: boolean;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  @HostBinding('class.offline') isOffline: boolean;

  constructor(
    private router: Router,
    private frameService: FrameService,
    private route: ActivatedRoute,
    private layoutService: LayoutService,
    private update: SwUpdate,
    private aboutService: AboutService,
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
    private pluginsService: PluginsService,
    private backend: BackendService
  ) {
    this.docuLink = this.aboutService.getDocumentationLink();
    const ie = this.authService.initError;
    if (ie) {
      this.initError =
        ie.key === 'invalid_grant'
          ? this.translateService.instant('yuv.client.frame.init.fail.invalidgrant')
          : this.translateService.instant('yuv.client.frame.init.fail');
    }

    this.pluginsService.getCustomPlugins('states').subscribe((states) => PluginGuard.updateRouter(router, states));
    this.navigationPlugins = this.pluginsService.getCustomPlugins('links', 'yuv-sidebar-navigation');
    this.settingsPlugins = this.pluginsService.getCustomPlugins('links', 'yuv-sidebar-settings');

    this.layoutService.loadLayoutOptions(this.LAYOUT_OPTIONS_KEY, this.LAYOUT_OPTIONS_ELEMENT_KEY).subscribe((o: any) => {
      this.moveNoticeDialogSkip = o?.moveNoticeDialogSkip || false;
    });

    this.iconRegistry.registerIcons([help, search, drawer, refresh, add, userDisabled, offline, close, openContext]);
    this.userService.user$.subscribe((user: YuvUser) => {
      if (user) {
        this.sidebarShowRetentions = this.userService.isRetentionManager;
        this.checkedForLogoutRoute = !(!this.user || this.user.id !== user.id);
        this.disableCreate = !this.userService.canCreateObjects;
        this.enableTenantSwitch = user.authorities.includes(UserRoles.MULTI_TENANT);
        if (this.disableCreate) {
          this.disableFileDrop = true;
        }
      }
      this.user = user;
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
      .pipe(untilDestroyed(this))
      .subscribe((event) => this.onObjetcsMove(event));

    this.eventService.on(YuvEventType.CLIENT_LOCALE_CHANGED).subscribe(() => {
      this.reloadComponent = false;
      setTimeout(() => (this.reloadComponent = true), 1);
    });

    // set html lang tag according to the client locale on every language change
    this.translateService.onLangChange.subscribe((_) => {
      document.documentElement.setAttribute('lang', this.translateService.currentLang);
    });
  }

  qsOverflow(qs: any) {
    return qs.extrasForm?.extrasForm?.nativeElement.offsetHeight > window.document.body.offsetHeight - 60;
  }

  onObjetcsMove(event) {
    if (this.moveNoticeDialogSkip === null || this.moveNoticeDialogSkip === false) {
      const popoverConfig = {
        maxHeight: '70%',
        width: 300,
        duration: 90,
        data: {
          title: this.translateService.instant('yuv.client.frame.move.notification.title.root'),
          newParent: null,
          succeeded: event.data.succeeded,
          numberMovedFiles: event.data.succeeded.length,
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
  }

  skipMoveDialog(skip: boolean) {
    if (skip !== null) {
      this.moveNoticeDialogSkip = skip;
      this.layoutService
        .saveLayoutOptions(this.LAYOUT_OPTIONS_KEY, this.LAYOUT_OPTIONS_ELEMENT_KEY, {
          moveNoticeDialogSkip: skip
        })
        .subscribe();
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
    const dbSizeProperty = '--theme-background-size';
    if (settings.dashboardBackground) {
      body.style.setProperty(dbProperty, 'url("' + settings.dashboardBackground + '")', 'important');
      body.style.setProperty(dbSizeProperty, 'cover', 'important');
    } else {
      body.style.removeProperty(dbProperty);
      body.style.removeProperty(dbSizeProperty);
    }
  }

  reload() {
    location.reload();
  }

  logout(event: MouseEvent, removeTenantCookie?: boolean) {
    event.preventDefault();
    if (removeTenantCookie) {
      document.cookie = 'tenant=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    this.frameService.appLogout();
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

  private processRouterRoutesRecognized(e: RoutesRecognized) {
    // transparent app-bar?
    this.tab = e.state.root?.firstChild?.data?.transparentAppBar;
  }
  private processRouterNavigationEnd(e: NavigationEnd) {
    this.getContextFromURL(e.urlAfterRedirects);
    // // transparent app-bar?
    // this.tab = e.urlAfterRedirects.startsWith('/dashboard');
    // disable fileDrop being on create state
    this.disableFileDrop = this.disableCreate || e.urlAfterRedirects.startsWith('/create');

    if (!this.checkedForLogoutRoute) {
      this.checkedForLogoutRoute = true;
      // redirect to the page the user logged out from the last time
      // but only if current route is not a deep link
      const ignoreRoutes = ['', 'dashboard', 'index.html'].map((s) => `${Utils.getBaseHref()}${s}`.replace('//', '/'));
      const currentRoute = this.routeWithBaseHref(this.router.routerState.snapshot.url);

      if (this.userService.getCurrentUser() && ignoreRoutes.includes(currentRoute)) {
        // get persisted routes to decide where to redirect the logged in user to
        forkJoin([
          // route the user left the app the last time (on logout)
          this.frameService.getRouteOnLogout(),
          // route the user initially requested when entering the app (may be deep link from e.g. a link)
          this.authService.getInitialRequestUri()
        ])
          .pipe(
            switchMap((res) => this.authService.resetInitialRequestUri().pipe(map((_) => res))),
            switchMap((res) => this.frameService.resetRouteOnLogout().pipe(map((_) => res)))
          )
          .subscribe((res: { uri: string; timestamp: number }[]) => {
            const logoutRes = res[0];
            const loginRes = res[1] && !ignoreRoutes.includes(res[1].uri) ? res[1] : null;

            if (logoutRes && loginRes) {
              // got logout and initial uri
              // redirect will happen based on which one has been saved last
              this.router.navigateByUrl((logoutRes.timestamp > loginRes.timestamp ? logoutRes : loginRes).uri);
            } else if (logoutRes) {
              // got only logout uri
              this.router.navigateByUrl(logoutRes.uri);
            } else if (loginRes) {
              // got only initial uri
              this.router.navigateByUrl(loginRes.uri);
            }
          });
      }
    }
  }

  ngOnInit() {
    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      if (!authenticated) {
        const tenant = this.authService.getTenant();
        if (tenant) {
          (window as any).location.href = `${this.backend.getApiBase('oauth')}/${tenant}`;
        }
      }
    });
    this.appSearch.query$.subscribe((q: SearchQuery) => {
      this.appQuery = q;
    });
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd || e instanceof RoutesRecognized)).subscribe((e: NavigationEnd | RoutesRecognized) => {
      if (e instanceof NavigationEnd) this.processRouterNavigationEnd(e);
      else if (e instanceof RoutesRecognized) this.processRouterRoutesRecognized(e);
    });
  }

  private routeWithBaseHref(r: string): string {
    return `${Utils.getBaseHref()}${r}`.replace('//', '/');
  }

  ngOnDestroy() {}
}
