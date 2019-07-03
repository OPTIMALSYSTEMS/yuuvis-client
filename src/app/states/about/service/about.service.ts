import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AboutData, Libraries, ProductDetails } from '../about.data.interface';
import { AboutInfo } from '../about.enum';

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  private libraries: Libraries[] = [];
  private librariesSubject: BehaviorSubject<Libraries[]> = new BehaviorSubject<
    Libraries[]
  >(this.libraries);
  libraries$: Observable<Libraries[]> = this.librariesSubject.asObservable();

  private productDetails: ProductDetails[] = [];
  private productDetailsSubject: BehaviorSubject<
    ProductDetails[]
  > = new BehaviorSubject<ProductDetails[]>(this.productDetails);
  productDetails$: Observable<
    ProductDetails[]
  > = this.productDetailsSubject.asObservable();

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
      url:
        'https://github.com/ceolter/ag-grid-enterprise/blob/master/LICENSE.md'
    }
  ];

  constructor(private http: HttpClient, private translate: TranslateService) {}

  getAboutData() {
    this.http.get('assets/about.data.json').subscribe(
      (response: AboutData) => {
        const { libraries, ...args } = response;
        this.generateLicenses(libraries);
        this.generateProductDetails(args);
      },
      error => {
        console.log(error);
      }
    );
  }

  generateLicenses(data: Libraries[]) {
    data.map(lib => {
      const match = this.licenses.find(lic => lic.id === lib.license);
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
    Object.keys(aboutDetails).forEach(key =>
      details.push({
        name: key,
        label: this.translate.instant(`eo.about.${key}.label`),
        value: aboutDetails[key],
        entry: AboutInfo[key]
      })
    );
    this.productDetailsSubject.next(details);
  }
}
