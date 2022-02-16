import { Component, OnInit } from '@angular/core';
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
  docuLink: string;

  ctrl: Observable<ProductDetails[]> = this.aboutService.productDetails$;

  constructor(private aboutService: AboutService) {}

  ngOnInit() {
    this.aboutService.getAboutData();
    this.docuLink = this.aboutService.getDocumentationLink();
  }
}
