import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { UserSettings, YuvUser } from '../../model/yuv-user.model';
import { BackendService } from '../backend/backend.service';
import { AppCacheService } from '../cache/app-cache.service';
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
  private STORAGE_KEY = 'yuv.core.auth.data';
  private authenticated: boolean;
  private authSource = new BehaviorSubject<boolean>(false);
  authenticated$: Observable<boolean> = this.authSource.asObservable();

  private authData: AuthData;

  constructor(
    @Inject(CORE_CONFIG) public coreConfig: CoreConfig,
    private config: ConfigService,
    private translate: TranslateService,
    private userService: UserService,
    private systemService: SystemService,
    private backend: BackendService,
    private appCache: AppCacheService
  ) {
    this.appCache.getItem(this.STORAGE_KEY).subscribe((data: AuthData) => {
      this.authData = data;
      if (data && data.language) {
        this.translate.use(data.language ? data.language : 'en');
        this.backend.setHeader('Accept-Language', data.language);
      }
      if (data && data.tenant) {
        this.backend.setHeader('X-ID-TENANT-NAME', data.tenant);
      }
    });
  }

  isLoggedIn() {
    return this.authenticated;
  }

  /**
   * Gets called while app init
   * @ignore
   */
  initUser(host?: string) {
    // setup default language for translate module
    let browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en|de/) ? browserLang : 'en');
    return this.fetchUser();

    // return this.storage.getItem(this.TOKEN_STORAGE_KEY).pipe(
    //   switchMap((res: any) => {
    //     // if (res) {
    //     //   // this.cloudLoginSetHeaders(res.accessToken, res.tenant);
    //     //   this.backend.setHost(host);
    //     // }
    //     return this.fetchUser();
    //   })
    // );
  }

  /**
   * Get the current tenant or the previous one persisted locally
   */
  getTenant(): string {
    return this.authData ? this.authData.tenant : null;
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
  logout() {
    this.authenticated = false;
    this.authSource.next(this.authenticated);
    // TODO: enable again: this.eventService.trigger(EnaioEvent.LOGOUT);
  }

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
        this.backend.setHeader('X-ID-TENANT-NAME', currentUser.tenant);

        this.authData = {
          tenant: currentUser.tenant,
          language: currentUser.getClientLocale()
        };
        this.appCache.setItem(this.STORAGE_KEY, this.authData).subscribe();

        return of(currentUser);
      })
    );
  }
}

interface AuthData {
  tenant: string;
  language: string;
}
