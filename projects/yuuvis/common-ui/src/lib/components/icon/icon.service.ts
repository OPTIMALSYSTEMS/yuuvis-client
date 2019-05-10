import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { tap, shareReplay, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { YuvCommonUiModule } from '../../common-ui.module';

@Injectable({
  providedIn: YuvCommonUiModule
})
export class IconService {

  private cache = new Map<string, any>();
  private temp = new Map<string, any>();

  constructor(private http: HttpClient) { }

  fetch(uri: string): Observable<any> {
    if (this.cache.has(uri)) {
      return of(this.cache.get(uri));
    } else {
      return this.getViaTempCache(uri, () => this.http.get(uri, { responseType: 'text' })
        .pipe(
          tap(text => this.cache.set(uri, text))
        )
      );
    }
  }

  private getViaTempCache(id: string, request: Function): Observable<any> {
    if (this.temp.has(id)) {
      return this.temp.get(id);
    } else {
      const resp = request().pipe(
        finalize(() => this.temp.delete(id)),
        shareReplay(1)
      );
      this.temp.set(id, resp);
      return resp;
    }
  }
}
