import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConnectionService, ConnectionState } from './connection.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineInterceptor implements HttpInterceptor {
  offline = false;

  constructor(private connectionService: ConnectionService) {
    this.connectionService.connection$.subscribe((connectionState: ConnectionState) => {
      this.offline = !connectionState.isOnline;
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (this.offline) {
    //   return throwError(new HttpErrorResponse({ error: 'Internet is required.' }));
    // }
    return next.handle(request);
  }
}
