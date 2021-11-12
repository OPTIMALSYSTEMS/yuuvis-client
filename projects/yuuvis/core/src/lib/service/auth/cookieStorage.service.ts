import { Injectable } from '@angular/core';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class CookieStorageService extends OAuthStorage {
  constructor(private cookieService: CookieService) {
    super();
  }

  getItem(key: string): string {
    return this.cookieService.get(key);
  }
  removeItem(key: string): void {
    this.cookieService.delete(key);
  }
  setItem(key: string, data: string): void {
    this.cookieService.set(key, data, null, null, null, false);
  }
}
