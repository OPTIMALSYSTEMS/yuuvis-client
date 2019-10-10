import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppCacheService, UserService, YuvUser } from '@yuuvis/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  routes = [];
  user: YuvUser;

  uiSettings = {
    darkMode: false,
    rtl: false
  };

  private STORAGE_KEY = 'yuv.cmp-test.settings';

  @HostBinding('class.showNav') showNav: boolean;
  // @HostBinding('class.dark') darkMode: boolean;

  constructor(private router: Router, private appCache: AppCacheService, private userService: UserService) {
    this.userService.user$.subscribe(u => {
      this.user = u;
    });
    this.appCache.getItem(this.STORAGE_KEY).subscribe(res => {
      this.uiSettings = res;
      this.applyUiSettings();
    });
  }

  toggleDirection() {
    this.uiSettings.rtl = !this.uiSettings.rtl;
    this.applyUiSettings();
    this.saveUiSettings();
  }

  toggleDarkMode() {
    this.uiSettings.darkMode = !this.uiSettings.darkMode;
    this.applyUiSettings();
    this.saveUiSettings();
  }

  private saveUiSettings() {
    this.appCache.setItem(this.STORAGE_KEY, this.uiSettings).subscribe();
  }

  private applyUiSettings() {
    const bodyClasses = document.getElementsByTagName('body')[0].classList;
    const outlet = document.getElementById('outlet');
    if (this.uiSettings.darkMode) {
      bodyClasses.add('dark');
    } else {
      bodyClasses.remove('dark');
    }
    if (this.uiSettings.rtl) {
      outlet.setAttribute('dir', 'rtl');
    } else {
      outlet.setAttribute('dir', 'ltr');
    }
  }

  ngOnInit() {
    this.routes = this.router.config.map(c => c.path);
  }
}
