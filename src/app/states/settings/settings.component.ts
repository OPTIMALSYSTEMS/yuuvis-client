import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ConfigService, TranslateService, UserService, YuvUser } from '@yuuvis/core';
import { LayoutService, LayoutSettings } from '@yuuvis/framework';
import { Observable } from 'rxjs';

@Component({
  selector: 'yuv-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user$: Observable<YuvUser>;
  darkMode: boolean;
  accentColor: string;
  customDashboardBackground: boolean;
  clientLocales: any;

  accentColorRGB = ['255, 152, 0', '120, 144, 156', '124, 179, 66', '3,169,244', '126,87,194', '236,64,122'];

  constructor(
    private translate: TranslateService,
    private layoutService: LayoutService,
    private titleService: Title,
    public config: ConfigService,
    private userService: UserService
  ) {
    this.clientLocales = config.getClientLocales();
  }

  changeClientLocale(iso: string) {
    this.userService.changeClientLocale(iso);
  }

  toggleTheme(darkMode: boolean) {
    this.layoutService.setDarkMode(darkMode);
  }

  setAccentColor(rgb: string) {
    this.layoutService.setAccentColor(rgb);
  }

  setBackgroundImage(e) {
    if (!e) {
      this.layoutService.setDashboardBackground(null);
    } else {
      const inputValue = e.target;
      var file: File = inputValue.files[0];
      var myReader: FileReader = new FileReader();
      // var fileType = inputValue.parentElement.id;
      myReader.onloadend = e => {
        console.log(myReader.result);
        this.layoutService.setDashboardBackground(myReader.result as string);
      };
      myReader.readAsDataURL(file);
    }
  }

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('yuv.client.state.settings.title'));
    this.user$ = this.userService.user$;
    this.layoutService.layoutSettings$.subscribe((settings: LayoutSettings) => {
      this.darkMode = settings.darkMode;
      this.accentColor = settings.accentColor;
      this.customDashboardBackground = !!settings.dashboardBackground;
    });
  }
}
