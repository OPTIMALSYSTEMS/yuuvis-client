import { Component, OnInit } from '@angular/core';
import { TranslateService, UserService, YuvUser, ConfigService } from '@yuuvis/core';

@Component({
  selector: 'yuv-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  user: YuvUser;
  clientLocales: any;

  constructor(private translate: TranslateService,
    public config: ConfigService,
    private userService: UserService) {
    this.clientLocales = config.getClientLocales();
  }

  changeClientLocale(iso: string) {
    this.userService.changeClientLocale(iso);
  }

  ngOnInit() {
    this.userService.user$.subscribe((user: YuvUser) => {
      this.user = user;
    });
  }

}
