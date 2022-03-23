import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, Sort, TranslateService, UserService, Utils } from '@yuuvis/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AboutData, Libraries, ProductDetails } from '../about.data.interface';
import { About, AboutInfo } from '../about.enum';

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  private libraries: Libraries[] = [];
  private librariesSubject: BehaviorSubject<Libraries[]> = new BehaviorSubject<Libraries[]>(this.libraries);
  libraries$: Observable<Libraries[]> = this.librariesSubject.asObservable();

  private productDetails: ProductDetails[] = [];
  private productDetailsSubject: BehaviorSubject<ProductDetails[]> = new BehaviorSubject<ProductDetails[]>(this.productDetails);
  productDetails$: Observable<ProductDetails[]> = this.productDetailsSubject.asObservable();

  licenses = [
    {
      id: 'MIT',
      label: 'MIT',
      url: 'http://opensource.org/licenses/MIT'
    },
    {
      id: 'Apache-2.0',
      label: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0'
    },
    {
      id: '0BSD',
      label: 'Zero-Clause BSD',
      url: 'https://opensource.org/licenses/0BSD'
    },
    {
      id: 'BSD-3-Clause-Clear',
      label: 'BSD 3-Clause',
      url: 'http://opensource.org/licenses/BSD-3-Clause'
    },
    {
      id: 'CC0-1.0',
      label: 'CC0 1.0',
      url: 'https://creativecommons.org/publicdomain/zero/1.0/'
    },
    {
      id: '(OFL-1.1 AND MIT)',
      label: 'MIT',
      url: 'http://opensource.org/licenses/MIT'
    },
    {
      id: 'SILOFL-1.1',
      label: 'SIL Open Font License 1.1',
      url: 'http://scripts.sil.org/OFL_web'
    },
    {
      id: 'Commercial',
      label: 'Commercial'
    },
    {
      id: 'ag-grid',
      label: 'ag-Grid-Enterprise Software Licence Agreement Version 1.7',
      url: 'https://github.com/ceolter/ag-grid-enterprise/blob/master/LICENSE.md'
    }
  ];

  constructor(private http: HttpClient, private userService: UserService, private configService: ConfigService, private translate: TranslateService) {}

  private getUserLanguage(language: string[], userLang: string): string {
    return language.includes(userLang) ? userLang : About.defaultLang;
  }

  getAboutData() {
    this.http.get('assets/about.data.json').subscribe(
      (response: AboutData) => {
        const { libraries, ...args } = response;
        this.generateLicenses(libraries);
        this.generateProductDetails(args);
      },
      (error) => console.log({ error })
    );
  }

  getDocumentationLink(): string {
    const clientDocu = this.configService.get('client.docu');
    if (clientDocu) {
      const { language, link } = clientDocu;
      const userLang = this.getUserLanguage(language, this.userService.getCurrentUser().getClientLocale());
      return link.replace('###userLang###', userLang);
    } else {
      return null;
    }
  }

  generateLicenses(data: Libraries[]) {
    data.map((lib) => {
      const match = this.licenses.find((lic) => lic.id === lib.license);
      if (match) {
        lib.label = match.label;
        lib.link = match.url;
      }
      return lib;
    });
    this.librariesSubject.next(data);
  }

  generateProductDetails(aboutDetails) {
    const details = [];

    const productLabel = {
      product: this.translate.instant('yuv.client.state.about.product.label'),
      version: this.translate.instant('yuv.client.state.about.client.version.label'),
      releasedate: this.translate.instant('yuv.client.state.about.releasedate.label'),
      author: this.translate.instant('yuv.client.state.about.author.label')
    };

    // enable to display product name in different languages
    aboutDetails.product = this.translate.instant('yuv.client.state.title') || aboutDetails.product;

    Object.keys(aboutDetails).forEach((key) =>
      details.push({
        name: key,
        label: productLabel[key],
        value: aboutDetails[key],
        entry: AboutInfo[key]
      })
    );

    details.sort(Utils.sortValues('label', Sort.DESC));
    this.productDetailsSubject.next(details);
  }
}
