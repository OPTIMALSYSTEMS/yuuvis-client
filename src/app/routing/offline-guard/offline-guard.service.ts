import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { ConnectionService, ConnectionState } from '@yuuvis/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfflineGuard implements CanActivate {
  isOnline = false;

  constructor(private connectionService: ConnectionService) {
    this.connectionService.connection$.subscribe((connectionState: ConnectionState) => {
      this.isOnline = connectionState.isOnline;
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.isOnline;
  }
}
