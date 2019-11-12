import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { AuthService, UploadResult, UserService, YuvUser } from '@yuuvis/core';
import { LayoutService, LayoutSettings } from '@yuuvis/framework';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'yuv-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {
  deferredPrompt: any;
  showButton = false;

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

  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e) {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    this.showButton = true;
  }

  @HostBinding('class.transparentAppBar') tab: boolean;
  swUpdateAvailable: boolean;
  hideAppBar = false;
  showSideBar = false;
  user: YuvUser;

  constructor(
    private router: Router,
    private layoutService: LayoutService,
    private update: SwUpdate,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.update.available.subscribe(update => {
      this.swUpdateAvailable = true;
    });

    this.layoutService.layoutSettings$.subscribe((settings: LayoutSettings) => {
      this.applyLayoutSettings(settings);
    });
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

  logout() {
    (window as any).location.href = '/logout';
  }

  navigate(state: string) {
    this.showSideBar = false;
    this.router.navigate([state]);
  }

  updateWorker() {
    this.update.activateUpdate().then(() => document.location.reload());
  }

  addToHomeScreen() {
    // hide our user interface that shows our A2HS button
    this.showButton = false;
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      this.deferredPrompt = null;
    });
  }

  onResultItemClick(res: UploadResult) {
    console.log(res);
  }

  ngOnInit() {
    this.userService.user$.subscribe((user: YuvUser) => {
      this.user = user;
    });

    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      if (!authenticated) {
        // this.router.navigate(['enter'], { preserveQueryParams: true });
        (window as any).location.href = `/oauth/${this.authService.getTenant()}`;
      }
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.tab = e.urlAfterRedirects.startsWith('/dashboard') || e.urlAfterRedirects.startsWith('/enter');
      this.hideAppBar = e.urlAfterRedirects.startsWith('/enter');
    });
  }
}
