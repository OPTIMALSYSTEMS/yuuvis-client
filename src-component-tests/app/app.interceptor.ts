import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from './app.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  constructor(public appService: AppService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const credentials = this.appService.getCurrentCredentials();
    if (!credentials) {
      return next.handle(request);
    } else {
      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Basic ${credentials.btoa}`).set('X-ID-TENANT-NAME', credentials.tenant)
        // .set('header3', 'header 3 value')

        // headers: new HttpHeaders({
        //   'Content-Type': 'application/json',
        //   Authorization: `Basic ${this.appService.getCredentials()}`
        // })
      });

      console.log('Intercepted HTTP call', authReq);

      return next.handle(authReq);
    }
  }
}
