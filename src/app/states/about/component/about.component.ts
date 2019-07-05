import { Component, OnInit } from '@angular/core';
import { ConfigService, UserService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { Libraries, ProductDetails } from '../about.data.interface';
import { About } from '../about.enum';
import { AboutService } from '../service/about.service';

@Component({
  selector: 'yuv-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  licenseShow: boolean = true;
  __libraries__: Observable<Libraries[]> = this.aboutService.libraries$;
  userLang: string;
  docuLink: Observable<string> = this.aboutService.aboutConfig$;

  ctrl: Observable<ProductDetails[]> = this.aboutService.productDetails$;

  constructor(
    private config: ConfigService,
    private userService: UserService,
    private aboutService: AboutService
  ) {
    this.getUserLang();
  }

  private getUserLanguage(language: string[]): string {
    return language.includes(this.userLang) ? this.userLang : About.defaultLang;
  }

  getUserLang() {
    this.userService.user$.subscribe(
      data => (this.userLang = data.userSettings.locale)
    );
  }

  trackByFn(index, item): number {
    return index;
  }

  ngOnInit() {
    this.aboutService.getAboutConfig(this.userLang);
    this.aboutService.getAboutData();
  }
}
