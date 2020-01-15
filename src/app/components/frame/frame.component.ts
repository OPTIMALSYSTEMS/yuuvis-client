import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
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
import { LayoutService, LayoutSettings } from '@yuuvis/framework';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'yuv-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {
  swUpdateAvailable: boolean;
  hideAppBar = false;
  showSideBar = false;
  user: YuvUser;
  offlineSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/></svg>`;

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
  @HostBinding('class.offline') offline: boolean;

  constructor(
    private router: Router,
    private layoutService: LayoutService,
    private update: SwUpdate,
    private connectionService: ConnectionService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.update.available.subscribe(update => (this.swUpdateAvailable = true));
    this.layoutService.layoutSettings$.subscribe((settings: LayoutSettings) => this.applyLayoutSettings(settings));
    this.connectionService.connection$.subscribe((connectionState: ConnectionState) => (this.offline = !connectionState.isOnline));
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
    if (this.currentRoute !== 'state') {
      this.showSideBar = false;
      this.router.navigate([state]);
    }
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
    this.userService.user$.subscribe((user: YuvUser) => (this.user = user));

    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      if (!authenticated) {
        const tenant = this.authService.getTenant();
        if (tenant) {
          (window as any).location.href = `/oauth/${tenant}`;
        }
      }
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => (this.tab = e.urlAfterRedirects.startsWith('/dashboard')));
  }
}
