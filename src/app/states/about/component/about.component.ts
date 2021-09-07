import { Component, OnInit } from '@angular/core';
import { UserService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { Libraries, ProductDetails } from '../about.data.interface';
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

  constructor(private userService: UserService, private aboutService: AboutService) {}

  ngOnInit() {
    this.userLang = this.userService.getCurrentUser().getClientLocale();
    this.aboutService.getAboutConfig(this.userLang);
    this.aboutService.getAboutData();
  }
}
