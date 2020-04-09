import { Injectable } from '@angular/core';
import { LocalStorage, StorageMap } from '@ngx-pwa/local-storage';
import { forkJoin, from, Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Utils } from '../../util/utils';

/**
 * Service for saving or caching data on the users device. It uses the most efficient storage
 * available  (IndexDB, localstorage, ...) on the device. Depending on the type of storage used,
 * its limitations apply.
 */
@Injectable({
  providedIn: 'root'
})
export class AppCacheService {
  constructor(private storage: LocalStorage, private storageMap: StorageMap) {}

  setItem(key: string, value: any): Observable<boolean> {
    return this.storage.setItem(key, value);
  }

  getItem(key: string): Observable<any> {
    return this.storage.getItem(key);
  }

  removeItem(key: string): Observable<boolean> {
    return this.storage.removeItem(key);
  }

  clear(): Observable<boolean> {
    return this.storage.clear();
  }

  getStorage(): Observable<any> {
    return from(this.storageMap.keys()).pipe(
      take(100),
      switchMap(keys =>
        forkJoin(
          Utils.arrayToObject(
            keys as any, // TODO: fix this
            o => o,
            k => this.getItem(k)
          )
        )
      )
    );
  }

  setStorage(options: any): Observable<any> {
    return forkJoin(Object.keys(options || {}).map(k => this.setItem(k, options[k])));
  }
}
