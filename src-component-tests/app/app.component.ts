import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppCacheService, Direction, UserService, YuvUser } from '@yuuvis/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  routes = [];
  user: YuvUser;
  accentColorRGB = ['255, 152, 0', '120, 144, 156', '124, 179, 66', '3,169,244', '126,87,194', '236,64,122'];

  uiSettings = {
    darkMode: false,
    direction: Direction.LTR,
    accentColor: null
  };

  private STORAGE_KEY = 'yuv.cmp-test.settings';
  @HostBinding('class.showNav') showNav: boolean;

  constructor(private router: Router, private appCache: AppCacheService, private userService: UserService) {
    this.userService.user$.subscribe(u => {
      this.user = u;
    });
    this.appCache.getItem(this.STORAGE_KEY).subscribe(res => {
      if (res) {
        this.uiSettings = res;
        this.applyUiSettings();
      }
    });
  }

  toggleDirection() {
    this.uiSettings.direction = this.uiSettings.direction === Direction.RTL ? Direction.LTR : Direction.RTL;
    this.applyUiSettings();
    this.saveUiSettings();
  }

  toggleDarkMode() {
    this.uiSettings.darkMode = !this.uiSettings.darkMode;
    this.applyUiSettings();
    this.saveUiSettings();
  }

  getBackgroundColor(rgb: string) {
    return `rgb(${rgb})`;
  }

  setAccentColor(color: string) {
    this.uiSettings.accentColor = color;
    this.applyUiSettings();
    this.saveUiSettings();
  }

  private saveUiSettings() {
    this.appCache.setItem(this.STORAGE_KEY, this.uiSettings).subscribe();
  }

  private applyUiSettings() {
    const bodyClasses = document.getElementsByTagName('body')[0].classList;
    if (this.uiSettings.darkMode) {
      bodyClasses.add('dark');
    } else {
      bodyClasses.remove('dark');
    }
    const body = document.getElementsByTagName('body')[0];
    body.setAttribute('dir', this.uiSettings.direction);
    if (this.uiSettings.direction === Direction.RTL) {
      bodyClasses.add('yuv-rtl');
    } else {
      bodyClasses.remove('yuv-rtl');
    }
    if (this.uiSettings.accentColor) {
      document.documentElement.style.setProperty('--color-accent-rgb', this.uiSettings.accentColor);
    } else {
      document.documentElement.style.removeProperty('--color-accent-rgb');
    }
  }

  ngOnInit() {
    this.routes = this.router.config.map(c => c.path);
  }
}
