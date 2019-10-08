import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService, Logger, TranslateService, YuvError } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ErrorHandlerService implements ErrorHandler, HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = this.injector.get(AuthService);
    const router = this.injector.get(Router);
    // need to use location here, because the router may not be ready
    const currentRouteUrl = location.href.substr(location.origin.length);

    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // do stuff with response if you want
          }
        },
        (error: any) => {
          if (error instanceof HttpErrorResponse || error.isHttpErrorResponse) {
            if (error.status === 401) {
              auth.logout();
              if (!currentRouteUrl.includes('/enter')) {
                const returnUrl = currentRouteUrl;
                const uriParamQuery: NavigationExtras = { queryParams: returnUrl ? { returnUrl } : {} };
                router.navigate(['/enter'], uriParamQuery).then(() => {
                  router.navigate([{ outlets: { modal: null } }], { queryParamsHandling: 'preserve' } as NavigationExtras);
                });
              }
            }
          }
        }
      )
    );
  }

  handleError(error) {
    if (error) {
      const logger = this.injector.get(Logger);
      const notificationsService = this.injector.get(NotificationService);
      const translate = this.injector.get(TranslateService);

      const title = error.name ? error.name : error.toString();
      const message = error.message ? error.message : '';

      if (!message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
        logger.error(error);
      } else {
        logger.warn(error);
      }

      if (error instanceof YuvError && error.skipNotification) {
        // do nothing: error is logged in console
      } else if (error instanceof HttpErrorResponse || error.isHttpErrorResponse) {
        if (error.status === 401) {
          // do nothing: interceptor handles the error
        } else {
          notificationsService.error(title, message);
        }
      } else if (error instanceof YuvError) {
        notificationsService.error(title, message);
      } else if (error instanceof TypeError) {
        notificationsService.error(title, message);
      } else if (error instanceof Error && !message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
        notificationsService.error(title, message);
      }
    }
  }
}
