import { Injectable } from '@angular/core';
import { LocalStorage, StorageMap } from '@ngx-pwa/local-storage';
import { forkJoin, Observable, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
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
  /**
   * @ignore
   */
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

  public clear(filter?: (key) => boolean): Observable<boolean> {
    return filter
      ? this.getStorageKeys().pipe(
          switchMap((keys) => {
            const list = keys.filter((k) => filter(k)).map((k) => this.removeItem(k));
            return list.length ? forkJoin(list).pipe(map(() => true)) : of(true);
          })
        )
      : this.storage.clear();
  }

  getStorageKeys(): Observable<any> {
    return new Observable<string[]>((observer) => {
      const keys = [];
      this.storageMap.keys().subscribe({
        next: (key) => keys.push(key),
        complete: () => observer.next(keys)
      });
    }).pipe(first());
  }

  getStorage(): Observable<any> {
    return this.getStorageKeys().pipe(
      switchMap((keys) =>
        keys.length
          ? forkJoin(
              Utils.arrayToObject(
                keys,
                (o) => o,
                (k) => this.getItem(k)
              )
            )
          : of({})
      )
    );
  }

  setStorage(options: any): Observable<any> {
    return forkJoin(Object.keys(options || {}).map((k) => this.setItem(k, options[k])));
  }
}
