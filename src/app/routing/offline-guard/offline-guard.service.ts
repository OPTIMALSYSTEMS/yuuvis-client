import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfflineGuard implements CanDeactivate<any> {
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return navigator.onLine;
  }
}
