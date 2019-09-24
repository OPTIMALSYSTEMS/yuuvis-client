import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ConfigService, TranslateService, UserService, YuvUser } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { AppCacheService } from './../../../../projects/yuuvis/core/src/lib/service/cache/app-cache.service';

@Component({
  selector: 'yuv-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // private STORAGE_KEY = 'yuv.tmp.settings'
  user$: Observable<YuvUser>;
  clientLocales: any;

  constructor(
    private translate: TranslateService,
    private appCache: AppCacheService,
    private titleService: Title,
    public config: ConfigService,
    private userService: UserService
  ) {
    this.clientLocales = config.getClientLocales();
    // this.appCache.getItem(this.STORAGE_KEY).subscribe
  }

  changeClientLocale(iso: string) {
    this.userService.changeClientLocale(iso);
  }

  toggleDarkMode() {}

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('yuv.client.state.settings.title'));
    this.user$ = this.userService.user$;
  }
}
