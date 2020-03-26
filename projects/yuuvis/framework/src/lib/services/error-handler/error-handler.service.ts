import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { AuthService, Logger, YuvError } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';

/**
 * @ignore
 * Interceptor fetching an handling errors in a global manner.
 */
@Injectable()
export class ErrorHandlerService implements ErrorHandler, HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = this.injector.get(AuthService);

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
            }
          }
        }
      )
    );
  }

  handleError(error) {
    if (error) {
      if (error instanceof HttpErrorResponse && !navigator.onLine) {
        return;
      }

      const logger = this.injector.get(Logger);
      const notificationsService = this.injector.get(NotificationService);
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
