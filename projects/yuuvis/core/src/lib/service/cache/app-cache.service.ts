import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';

/**
 * Service for saving or caching data on the users device. It uses the most efficient storage
 * available  (IndexDB, localstorage, ...) on the device. Depending on the type of storage used,
 * its limitations apply.
 */
@Injectable({
  providedIn: 'root'
})
export class AppCacheService {
  constructor(private storage: LocalStorage) {}

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
}
