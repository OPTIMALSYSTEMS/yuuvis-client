import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private STORAGE_KEY = 'cmp.cred';
  private credentials: Credentials;
  private off: boolean;

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

  toggleCredentials(): boolean {
    if (!this.off) {
      this.credentialsSource.next(null);
      this.off = true;
    } else {
      this.credentialsSource.next(this.credentials);
      this.off = false;
    }
    return this.off;
  }

  getCurrentCredentials() {
    // return this.credentials;
    return this.off ? null : this.credentials;
  }
}

interface Credentials {
  btoa: string;
  tenant: string;
}
