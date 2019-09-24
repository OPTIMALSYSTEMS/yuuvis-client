import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { UserSettings, YuvUser } from '../../model/yuv-user.model';
import { BackendService } from '../backend/backend.service';
import { ConfigService } from '../config/config.service';
import { CoreConfig } from '../config/core-config';
import { CORE_CONFIG } from '../config/core-config.tokens';
import { SystemService } from '../system/system.service';
import { UserService } from '../user/user.service';

/**
 * Got some code here
 *
 * ```html
 * <h1>Thats my stuff</h1>
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private TOKEN_STORAGE_KEY = 'eo.auth.cloud.credentials';
  private authenticated: boolean;
  private authSource = new BehaviorSubject<boolean>(false);
  authenticated$: Observable<boolean> = this.authSource.asObservable();

  constructor(
    @Inject(CORE_CONFIG) public coreConfig: CoreConfig,
    private config: ConfigService,
    private translate: TranslateService,
    private ngZone: NgZone,
    private userService: UserService,
    private systemService: SystemService,
    private backend: BackendService,
    private storage: LocalStorage,
    private http: HttpClient
  ) {}

  isLoggedIn() {
    return this.authenticated;
  }

  // startLoginFlow(tenant: string, host?: string): { cancelTrigger: Subject<void>; loginState: Observable<LoginState> } {
  //   const stopTrigger$ = new Subject<void>();
  //   return {
  //     cancelTrigger: stopTrigger$,
  //     loginState: new Observable(o => {
  //       const loginState: LoginState = {
  //         name: null,
  //         data: null
  //       };

  //       // get rid of tailing slashes as this would confuse redirection flow
  //       if (host.endsWith('/')) {
  //         host = host.substring(0, host.length - 1);
  //       }
  //       const targetHost = host || '';
  //       this.http.get(`${targetHost}/tenant/${tenant}/loginDevice`).subscribe(
  //         (res: LoginDeviceResult) => {
  //           const targetUri = `${targetHost}/oauth/${tenant}?user_code=${res.user_code}`;

  //           loginState.name = LoginStateName.STATE_LOGIN_URI;
  //           loginState.data = targetUri;
  //           o.next(loginState);

  //           this.cloudLoginPollForResult(`${targetHost}/auth/info/state?device_code=${res.device_code}`, 1000, stopTrigger$)
  //             .pipe(
  //               tap(accessToken => {
  //                 if (accessToken) {
  //                   this.cloudLoginSetHeaders(accessToken, tenant);
  //                   const storeToken: StoredToken = {
  //                     tenant: tenant,
  //                     accessToken: accessToken
  //                   };
  //                   this.storage.setItem(this.TOKEN_STORAGE_KEY, storeToken).subscribe();
  //                 }
  //               }),
  //               switchMap((authRes: any) => (authRes ? this.initUser(targetHost) : throwError('not authenticated')))
  //             )
  //             .subscribe(
  //               (user: YuvUser) => {
  //                 loginState.name = LoginStateName.STATE_DONE;
  //                 loginState.data = user;

  //                 o.next(loginState);
  //                 o.complete();
  //               },
  //               err => {
  //                 o.error(err);
  //                 o.complete();
  //               },
  //               () => {
  //                 // polling may complete without a result or error, when it was canceled
  //                 loginState.name = LoginStateName.STATE_CANCELED;
  //                 loginState.data = null;
  //                 o.next(loginState);
  //                 o.complete();
  //               }
  //             );
  //         },
  //         error => {
  //           o.error('unable to call device flow endpoint');
  //           o.complete();
  //         }
  //       );
  //     })
  //   };
  // }

  /**
   * Gets called while app init
   * @ignore
   */
  initUser(host?: string) {
    // setup default language for translate module
    let browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en|de/) ? browserLang : 'en');

    return this.storage.getItem(this.TOKEN_STORAGE_KEY).pipe(
      switchMap((res: any) => {
        // if (res) {
        //   // this.cloudLoginSetHeaders(res.accessToken, res.tenant);
        //   this.backend.setHost(host);
        // }
        return this.fetchUser();
      })
    );
  }

  fetchUser(): Observable<YuvUser> {
    return this.backend.get(this.userService.USER_FETCH_URI).pipe(
      tap(() => {
        this.authenticated = true;
        this.authSource.next(this.authenticated);
      }),
      switchMap((userJson: any) => this.initApp(userJson))
    );
  }

  /**
   * Logs out the current user.
   * @param gatewayLogout Flag indicating whether or not to perform a gateway logout as well
   */
  logout(gatewayLogout?: boolean) {
    this.authenticated = false;
    this.authSource.next(this.authenticated);

    (window as any).location.href = '/logout';

    // // remove stored access data
    // this.storage.removeItem(this.TOKEN_STORAGE_KEY).subscribe();
    // if (this.coreConfig.environment.production && YuvEnvironment.isWebEnvironment()) {
    //   (window as any).location.href = '/logout';
    //   return;
    // }

    // if (gatewayLogout) {
    //   // by default we are just resetting internal state to 'logged out' and in
    //   // some cases call gateways logout endpoint to do logout stuff there silently
    //   this.http
    //     // .get(`${this.backend.getHost()}/logout`, {
    //     .get(`/logout`, {
    //       observe: 'response',
    //       responseType: 'arraybuffer'
    //     })
    //     .subscribe(
    //       res => {
    //         console.log(res);
    //         this.http.get(res.url).subscribe();
    //       },
    //       err => {
    //         console.error(err);
    //       }
    //     );
    // }
    // this.backend.setHost(null);
    // this.cloudLoginRemoveHeaders();
    // TODO: enable again: this.eventService.trigger(EnaioEvent.LOGOUT);
  }

  // /**
  //  * Starts polling for login results in case of logging in to a cloud backend.
  //  * @param uri URI to poll
  //  * @param pollingInterval Polling intervall in milliseconds
  //  * @param stopTrigger Subject acting as stop trigger
  //  * @returns Access Token if logged in successfully or NULL otherwise
  //  */
  // private cloudLoginPollForResult(uri: string, pollingInterval: number, stopTrigger: Subject<void> = new Subject<void>()): Observable<string> {
  //   return Observable.create(o => {
  //     let accessGranted = false;
  //     let accessDenied = false;

  //     this.ngZone.runOutsideAngular(() => {
  //       interval(pollingInterval)
  //         .pipe(
  //           takeUntil(stopTrigger),
  //           switchMap(() =>
  //             this.http.get(uri).pipe(
  //               catchError((err: HttpErrorResponse) => {
  //                 // OAuth standard we are using is returning with a status of 400 while logging in (no idea why???)
  //                 // so we got to fetch that to not break the parent pipe
  //                 if (err.status === 400) {
  //                   return of(err.error);
  //                 } else {
  //                   throwError(err);
  //                 }
  //               })
  //             )
  //           )
  //         )
  //         .subscribe(
  //           (res: any) => {
  //             this.ngZone.run(() => {
  //               accessGranted = !!res.access_token;
  //               accessDenied = res.error === 'access_denied';

  //               if (accessGranted || accessDenied) {
  //                 // logged in
  //                 stopTrigger.next();
  //                 stopTrigger.complete();
  //                 o.next(accessGranted ? res.access_token : null);
  //                 o.complete();
  //               } else if (res.error === 'expired_token') {
  //                 // expired so skip polling
  //                 throwError('Token expired');
  //               }
  //             });
  //           },
  //           err => {
  //             this.ngZone.run(() => {
  //               o.error(err);
  //               o.complete();
  //             });
  //           },
  //           () => {
  //             this.ngZone.run(() => {
  //               o.complete();
  //             });
  //           }
  //         );
  //     });
  //   });
  // }

  // private cloudLoginSetHeaders(accessToken: string, tenant: string) {
  //   this.backend.setHeader('Authorization', 'bearer ' + accessToken);
  //   this.backend.setHeader('X-ID-TENANT-NAME', tenant);
  // }

  // private cloudLoginRemoveHeaders() {
  //   this.backend.setHeader('Authorization', null);
  //   this.backend.setHeader('X-ID-TENANT-NAME', null);
  // }

  /**
   * Initialize/setup the application for a given user.
   * @param user
   * @returns Observable<YuvUser>
   */
  private initApp(userJson: any): Observable<YuvUser> {
    return this.systemService.getSystemDefinition().pipe(
      switchMap(() => this.userService.fetchUserSettings()),
      switchMap((userSettings: UserSettings) => {
        const currentUser = new YuvUser(userJson, userSettings);
        this.userService.setCurrentUser(currentUser);
        this.backend.setHeader('Accept-Language', currentUser.getClientLocale());
        return of(currentUser);
      })
    );
  }
}
