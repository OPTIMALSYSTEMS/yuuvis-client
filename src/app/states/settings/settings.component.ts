import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ConfigService, TranslateService, UserService, YuvUser } from '@yuuvis/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'yuv-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user$: Observable<YuvUser>;
  clientLocales: any;

  constructor(private translate: TranslateService, private titleService: Title, public config: ConfigService, private userService: UserService) {
    this.clientLocales = config.getClientLocales();
  }

  changeClientLocale(iso: string) {
    this.userService.changeClientLocale(iso);
  }

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('yuv.client.state.settings.title'));
    this.user$ = this.userService.user$;
  }
}
