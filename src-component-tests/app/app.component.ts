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
    highContrast: false,
    darkMode: false,
    direction: 'ltr',
    accentColor: null
  };

  private STORAGE_KEY = 'yuv.cmp-test.settings';
  @HostBinding('class.showNav') showNav: boolean;

  constructor(private router: Router, private appCache: AppCacheService, private userService: UserService) {
    this.userService.user$.subscribe((u) => {
      this.user = u;
    });
    this.appCache.getItem(this.STORAGE_KEY).subscribe((res) => {
      if (res) {
        this.uiSettings = res;
        this.applyUiSettings();
      }
    });
  }

  toggleDirection() {
    this.setDirection(this.uiSettings.direction === Direction.RTL ? Direction.LTR : Direction.RTL);
  }

  setDirection(dir: string) {
    this.uiSettings.direction = dir;
    this.applyUiSettings();
    this.saveUiSettings();
  }

  toggleDarkMode() {
    this.setDarkMode(!this.uiSettings.darkMode);
  }

  setDarkMode(darkMode: boolean) {
    this.uiSettings.darkMode = darkMode;
    this.applyUiSettings();
    this.saveUiSettings();
  }

  toggleHighContrast() {
    this.setHighContrast(!this.uiSettings.highContrast);
  }

  setHighContrast(hc: boolean) {
    this.uiSettings.highContrast = hc;
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
    const root = document.getElementsByTagName('body')[0];
    const bodyClasses = root.classList;
    if (this.uiSettings.darkMode) {
      root.setAttribute('dark', '');
      bodyClasses.add('dark');
    } else {
      root.removeAttribute('dark');
      bodyClasses.remove('dark');
    }
    if (this.uiSettings.highContrast) {
      root.setAttribute('contrast', '');
      bodyClasses.add('contrast');
    } else {
      root.removeAttribute('contrast');
      bodyClasses.remove('contrast');
    }
    root.setAttribute('dir', this.uiSettings.direction);
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
    this.routes = this.router.config.map((c) => c.path);
  }
}
