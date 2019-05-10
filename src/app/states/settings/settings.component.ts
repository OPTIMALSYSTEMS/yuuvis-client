import { Component, OnInit } from '@angular/core';
import { TranslateService, UserService, YuvUser } from '@yuuvis/core';

@Component({
  selector: 'yuv-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  user: YuvUser;

  constructor(private translate: TranslateService,
    private userService: UserService) { }

  lang(lang) {
    this.translate.use(lang);
  }

  ngOnInit() {
    this.userService.user$.subscribe((user: YuvUser) => {
      this.user = user;
    });
  }

}
