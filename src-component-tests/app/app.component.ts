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
  darkMode: boolean;

  private STORAGE_KEY = 'yuv.cmp-test.settings';

  @HostBinding('class.showNav') showNav: boolean;
  // @HostBinding('class.dark') darkMode: boolean;

  constructor(private router: Router, private appCache: AppCacheService, private userService: UserService) {
    this.userService.user$.subscribe(u => {
      this.user = u;
    });
    this.appCache.getItem(this.STORAGE_KEY).subscribe(res => {
      this.darkMode = res.darkMode;
      this.setDarkMode();
    });
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.setDarkMode();
    this.appCache
      .setItem(this.STORAGE_KEY, {
        darkMode: this.darkMode
      })
      .subscribe();
  }

  private setDarkMode() {
    const bodyClasses = document.getElementsByTagName('body')[0].classList;
    if (this.darkMode) {
      bodyClasses.add('dark');
    } else {
      bodyClasses.remove('dark');
    }
  }

  ngOnInit() {
    this.routes = this.router.config.map(c => c.path);
  }
}
