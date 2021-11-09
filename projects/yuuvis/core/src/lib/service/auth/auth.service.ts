import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserSettings, YuvUser } from '../../model/yuv-user.model';
import { BackendService } from '../backend/backend.service';
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
    private userService: UserService,
    private systemService: SystemService,
    private backend: BackendService
  ) {}

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
    return this.authData?.tenant;
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
    return this.userService.fetchUserSettings().pipe(
      switchMap((userSettings: UserSettings) => {
        const currentUser = new YuvUser(userJson, userSettings);
        this.userService.setCurrentUser(currentUser);
        this.authData = {
          tenant: currentUser.tenant,
          language: currentUser.getClientLocale()
        };
        return this.systemService.getSystemDefinition(this.authData).pipe(map(() => currentUser));
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
