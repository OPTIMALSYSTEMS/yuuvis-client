import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private STORAGE_KEY = 'cmp.cred';
  private credentials: Credentials;

  private credentialsSource = new ReplaySubject<Credentials>();
  public credentials$: Observable<Credentials> = this.credentialsSource.asObservable();

  constructor(protected storage: LocalStorage) {
    this.storage.getItem(this.STORAGE_KEY).subscribe((res: Credentials) => {
      this.credentials = res;
      this.credentialsSource.next(this.credentials);
    });
  }

  setCredentials(tenant: string, username: string, password: string) {
    this.credentials = {
      btoa: btoa(`${username}:${password}`),
      tenant: tenant
    };
    this.credentialsSource.next(this.credentials);
    this.storage.setItem(this.STORAGE_KEY, this.credentials).subscribe();
  }

  clearCredentials() {
    this.credentials = null;
    this.credentialsSource.next(this.credentials);
    this.storage.setItem(this.STORAGE_KEY, this.credentials).subscribe();
  }

  getCurrentCredentials() {
    return this.credentials;
  }
}

interface Credentials {
  btoa: string;
  tenant: string;
}
