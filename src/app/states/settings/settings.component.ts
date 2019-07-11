import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ConfigService,
  TranslateService,
  UserService,
  YuvUser
} from '@yuuvis/core';

@Component({
  selector: 'yuv-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: YuvUser;
  clientLocales: any;

  constructor(
    private translate: TranslateService,
    private titleService: Title,
    public config: ConfigService,
    private userService: UserService
  ) {
    this.clientLocales = config.getClientLocales();
  }

  changeClientLocale(iso: string) {
    this.userService.changeClientLocale(iso);
  }

  ngOnInit() {
    this.titleService.setTitle(
      this.translate.instant('eo.state.settings.title')
    );
    this.userService.user$.subscribe((user: YuvUser) => {
      this.user = user;
    });
  }
}
