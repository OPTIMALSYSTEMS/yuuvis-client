import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { IconRegistryService } from '@yuuvis/common-ui';
import {
  AuthService,
  BaseObjectTypeField,
  ConnectionService,
  ConnectionState,
  SearchFilter,
  SearchQuery,
  UploadResult,
  UserService,
  YuvUser
} from '@yuuvis/core';
import { LayoutService, LayoutSettings, Screen, ScreenService } from '@yuuvis/framework';
import { filter } from 'rxjs/operators';
import { add, close, drawer, offline, refresh, search, userDisabled } from '../../../assets/default/svg/svg';
import { AppSearchService } from '../../service/app-search.service';

@Component({
  selector: 'yuv-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {
  swUpdateAvailable: boolean;
  hideAppBar: boolean;
  showSideBar: boolean;
  screenSmall: boolean;
  showSearch: boolean;
  user: YuvUser;
  appQuery: SearchQuery;

  @HostListener('window:dragover', ['$event']) onDragOver(e) {
    let transfer = e.dataTransfer;
    if (!transfer) {
      return;
    }
    transfer.dropEffect = 'none';
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
    private layoutService: LayoutService,
    private update: SwUpdate,
    private appSearch: AppSearchService,
    private connectionService: ConnectionService,
    private authService: AuthService,
    private screenService: ScreenService,
    private userService: UserService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([search, drawer, refresh, add, userDisabled, offline, close]);
    this.userService.user$.subscribe((user: YuvUser) => {
      this.user = user;
    });
    this.update.available.subscribe(update => (this.swUpdateAvailable = true));
    this.layoutService.layoutSettings$.subscribe((settings: LayoutSettings) => this.applyLayoutSettings(settings));
    this.connectionService.connection$.subscribe((connectionState: ConnectionState) => {
      this.isOffline = !connectionState.isOnline;
    });
    this.screenService.screenChange$.subscribe((s: Screen) => {
      this.screenSmall = s.isSmall;
    });
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

  toggleSearch(visible: boolean) {
    this.showSearch = visible;
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
      this.showSideBar = false;
      this.router.navigate([state]);
    }
  }

  async onQuickSearchQuery(query: SearchQuery) {
    this.appSearch.setQuery(query);
    const navigationExtras: NavigationExtras = { queryParams: { query: JSON.stringify(query.toQueryJson()) } };
    await this.router.navigate(['/result'], navigationExtras);
  }

  updateWorker() {
    this.update.activateUpdate().then(() => document.location.reload());
  }

  onResultItemClick(res: UploadResult) {
    if (Array.isArray(res.objectId)) {
      const searchQuery = new SearchQuery();
      searchQuery.addFilter(new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.IN, res.objectId));
      this.router.navigate(['/result'], { queryParams: { query: JSON.stringify(searchQuery.toQueryJson()) } });
    } else {
      this.router.navigate(['/object', res.objectId]);
    }
  }

  ngOnInit() {
    // this.userService.user$.subscribe((user: YuvUser) => {
    //   this.user = user;
    // });
    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      if (!authenticated) {
        const tenant = this.authService.getTenant();
        if (tenant) {
          (window as any).location.href = `/oauth/${tenant}`;
        }
      }
    });
    this.appSearch.query$.subscribe((q: SearchQuery) => (this.appQuery = q));
    this.router.events
      .pipe(
        // tap(e => console.log(e)),
        filter(e => e instanceof NavigationEnd)
      )
      .subscribe((e: NavigationEnd) => {
        this.tab = e.urlAfterRedirects.startsWith('/dashboard');
        // hide open search bar when leaving state
        this.toggleSearch(false);
      });
  }
}
