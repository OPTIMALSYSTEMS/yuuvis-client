import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { AuthService, UserService, YuvUser } from '@yuuvis/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'yuv-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {
  deferredPrompt: any;
  showButton = false;

  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e) {
    console.log(e);
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

  constructor(private router: Router, private update: SwUpdate, private push: SwPush, private authService: AuthService, private userService: UserService) {
    this.update.available.subscribe(update => {
      this.swUpdateAvailable = true;
    });
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

  ngOnInit() {
    this.userService.user$.subscribe((user: YuvUser) => {
      this.user = user;
    });

    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      if (!authenticated) {
        this.router.navigate(['enter'], { preserveQueryParams: true });
      }
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.tab = e.urlAfterRedirects.startsWith('/dashboard') || e.urlAfterRedirects.startsWith('/enter');
      this.hideAppBar = e.urlAfterRedirects.startsWith('/enter');
    });
  }
}
