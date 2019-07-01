import { Component } from '@angular/core';
import { ConfigService, UserService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { Libraries } from '../about.data.interface';
import { AboutService } from '../service/about.service';

@Component({
  selector: 'yuv-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  licenseShow: boolean = true;
  __libraries__: Observable<Libraries[]> = this.aboutService.libraries$;
  userLang: string;
  docu: { link: string; label: string };

  ctrl = {
    productName: 'enaio® redline client',
    clientVersion: '__coreversion__',
    releaseDate: '__releasedate__'
  };

  constructor(
    private config: ConfigService,
    private userService: UserService,
    private aboutService: AboutService
  ) {
    this.getUserLang();
    this.getDocumentation();
  }

  getDocumentation() {
    const docu = this.config.get('about.docu');
    const link = docu.link.replace('###userLang###', this.userLang);
    this.docu = { ...docu, link };
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
    this.aboutService.getAboutData();
  }
}
