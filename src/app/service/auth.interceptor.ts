import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackendService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FrameService } from '../components/frame/frame.service';

/**
 * Prevent app from running into 401 issues related to gateway timeouts.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  /**
   * @ignore
   */
  constructor(private frameService: FrameService, private backend: BackendService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // do stuff with response if you want
          }
        },
        (error: any) => {
          if (error instanceof HttpErrorResponse || error.isHttpErrorResponse) {
            if (error.status === 401 && !this.backend.authUsesOpenIdConnect()) {
              this.frameService.appLogout();
            }
          }
        }
      )
    );
  }
}
