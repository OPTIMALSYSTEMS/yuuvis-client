import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { UserSettings, YuvUser } from '../../model/yuv-user.model';
import { BackendService } from '../backend/backend.service';
import { AppCacheService } from '../cache/app-cache.service';
import { CoreConfig } from '../config/core-config';
import { CORE_CONFIG } from '../config/core-config.tokens';
import { EventService } from '../event/event.service';
import { YuvEventType } from '../event/events';
import { SystemService } from '../system/system.service';
import { UserService } from '../user/user.service';

/**
 * Service handling authentication related issues.
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

  /**
   * @ignore
   */
  constructor(
    @Inject(CORE_CONFIG) public coreConfig: CoreConfig,
    private eventService: EventService,
    private translate: TranslateService,
    private userService: UserService,
    private systemService: SystemService,
    private backend: BackendService,
    private appCache: AppCacheService
  ) {}

  /**
   * called on core init
   */

  init(): Observable<any> {
    /**
     * load authentication related properties stored from previous sessions
     */
    return this.appCache.getItem(this.STORAGE_KEY).pipe(
      tap((data: AuthData) => {
        this.authData = data;
        if (data && data.language) {
          this.backend.setHeader('Accept-Language', data.language);
        }
        if (data && data.tenant) {
          this.backend.setHeader('X-ID-TENANT-NAME', data.tenant);
        }
      })
    );
  }

  isLoggedIn() {
    return this.authenticated;
  }

  /**
   * Called while app/core is initialized (APP_INITIALIZER)
   * @ignore
   */
  initUser(host?: string) {
    return this.fetchUser();
  }

  /**
   * Get the current tenant or the previous one persisted locally
   */
  getTenant(): string {
    return this.authData ? this.authData.tenant : null;
  }

  /**
   * Fetch information about the user currently logged in
   */
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
   */
  logout() {
    this.authenticated = false;
    this.authSource.next(this.authenticated);
    this.eventService.trigger(YuvEventType.LOGOUT);
  }

  /**
   * Initialize/setup the application for a given user. This involves fetching
   * settings and schema information.
   * @param userJson Data retrieved from the backend
   */
  private initApp(userJson: any): Observable<YuvUser> {
    return this.systemService.getSystemDefinition().pipe(
      switchMap(() => this.userService.fetchUserSettings()),
      switchMap((userSettings: UserSettings) => {
        const currentUser = new YuvUser(userJson, userSettings);
        this.userService.setCurrentUser(currentUser);
        this.authData = {
          tenant: currentUser.tenant,
          language: currentUser.getClientLocale()
        };
        this.backend.setHeader('Accept-Language', this.authData.language);
        this.backend.setHeader('X-ID-TENANT-NAME', this.authData.tenant);
        this.appCache.setItem(this.STORAGE_KEY, this.authData).subscribe();
        return of(currentUser);
      })
    );
  }
}

/**
 * Authentication Data
 */
export interface AuthData {
  /**
   * tenant name
   */
  tenant: string;
  language: string;
}
