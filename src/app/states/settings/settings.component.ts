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
      this.myReader(result => this.layoutService.setDashboardBackground(result)).readAsDataURL(e.target.files[0]);
    }
  }

  downloadLayout() {
    this.layoutService.downloadLayout();
  }

  uploadLayout(e: any) {
    this.myReader(result => this.layoutService.uploadLayout(result).subscribe()).readAsText(e.target.files[0]);
  }

  clearLayout(e: any) {
    this.layoutService.clearLayout().subscribe();
  }

  private myReader(success?: (result: string) => void, error?: (err: any) => void) {
    const myReader: FileReader = new FileReader();
    myReader.onloadend = e => success && success(myReader.result as string);
    myReader.onerror = e => error && error(e);
    return myReader;
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
