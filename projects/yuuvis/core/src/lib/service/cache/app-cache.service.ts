import { Injectable } from '@angular/core';
import { LocalStorage, StorageMap } from '@ngx-pwa/local-storage';
import { forkJoin, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
    return new Observable<string[]>(observer => {
      const keys = [];
      this.storageMap.keys().subscribe({
        next: key => keys.push(key),
        complete: () => observer.next(keys)
      });
    }).pipe(
      switchMap(keys =>
        forkJoin(
          Utils.arrayToObject(
            keys,
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
