import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';

/** soon to be gone */
@Injectable()
export class IconService {
  private cache = new Map<string, any>();
  private temp = new Map<string, any>();

  constructor(private http: HttpClient) {}

  fetch(uri: string): Observable<any> {
    return this.cache.has(uri)
      ? of(this.cache.get(uri))
      : this.getViaTemplateCache(uri, () => this.http.get(uri, { responseType: 'text' }).pipe(tap(text => this.cache.set(uri, text))));
  }

  private getViaTemplateCache(id: string, request: Function): Observable<any> {
    if (this.temp.has(id)) {
      return this.temp.get(id);
    } else {
      const res = request().pipe(
        finalize(() => this.temp.delete(id)),
        shareReplay(1)
      );
      this.temp.set(id, res);
      return res;
    }
  }
}
