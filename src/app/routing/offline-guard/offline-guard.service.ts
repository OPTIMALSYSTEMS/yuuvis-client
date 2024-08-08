import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfflineGuard  {
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return navigator.onLine;
  }
}
