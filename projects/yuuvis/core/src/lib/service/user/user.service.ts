import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UserSettings, YuvUser } from '../../model/yuv-user.model';
import { OidcService } from '../auth/oidc.service';
import { BackendService } from '../backend/backend.service';
import { Direction } from '../config/config.interface';
import { ConfigService } from '../config/config.service';
import { EventService } from '../event/event.service';
import { YuvEventType } from '../event/events';
import { Logger } from '../logger/logger';
import { AdministrationRoles } from '../system/system.enum';
import { UserPermissions, UserPermissionsSection } from '../system/system.interface';
import { SystemService } from '../system/system.service';

/**
 * Service providing user account configurations.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  static USERS_SETTINGS = '/users/settings/';
  static DEFAULT_SETTINGS = '/users/settings';

  USER_FETCH_URI = '/idm/whoami';
  private user: YuvUser = null;
  private userSource = new BehaviorSubject<YuvUser>(this.user);
  user$: Observable<YuvUser> = this.userSource.asObservable();

  globalSettings = new Map();
  userPermissions: UserPermissions;

  /**
   * @ignore
   */
  constructor(
    private backend: BackendService,
    private translate: TranslateService,
    private logger: Logger,
    private system: SystemService,
    private oidc: OidcService,
    private eventService: EventService,
    private config: ConfigService
  ) { }

  private getUiDirection(iso: string): string {
    // languages that are read right to left
    const rtlLanguages = ['ar', 'arc', 'dv', 'fa', 'ha', 'he', 'khw', 'ks', 'ku', 'ps', 'ur', 'yi'];
    return rtlLanguages.indexOf(iso) === -1 ? Direction.LTR : Direction.RTL;
  }

  /**
   * Set a new current user
   * @param user The user to be set as current user
   */
  public setCurrentUser(user: YuvUser) {
    this.user = user;
    this.changeClientLocale('', false);
    this.userSource.next(this.user);
  }

  getCurrentUser(): YuvUser {
    return this.user;
  }

  get hasAdminRole(): boolean {
    return this.user?.authorities?.includes(AdministrationRoles.ADMIN) || false;
  }

  get hasSystemRole(): boolean {
    return this.user?.authorities?.includes(AdministrationRoles.SYSTEM) || false;
  }

  get hasAdministrationRoles(): boolean {
    return this.hasAdminRole || this.hasSystemRole;
  }

  get hasManageSettingsRole(): boolean {
    const customRole = this.config.get('core.permissions.manageSettingsRole');
    const manageSettingsRole = customRole || AdministrationRoles.MANAGE_SETTINGS;
    return this.user?.authorities?.includes(manageSettingsRole) || false;
  }

  get isAdvancedUser(): boolean {
    const customRole = this.config.get('core.permissions.advancedUserRole');
    const advancedUserRole = customRole || AdministrationRoles.MANAGE_SETTINGS;
    return this.user?.authorities?.includes(advancedUserRole) || false;
  }

  get isRetentionManager(): boolean {
    const customRole = this.config.get('core.permissions.retentionManagerRole');
    const retenetionManagerRole = customRole || AdministrationRoles.MANAGE_SETTINGS;
    return this.user?.authorities?.includes(retenetionManagerRole) || false;
  }

  canCreateObjects: boolean;

  /**
   * Change the users client locale
   * @param iso ISO locale string to be set as new client locale
   */
  changeClientLocale(iso: string, persist = true): void {
    if (this.user) {
      const languages = this.config.getClientLocales().map((lang) => lang.iso);
      iso = iso || this.user.getClientLocale(this.config.getDefaultClientLocale());
      if (!languages.includes(iso)) {
        iso = this.config.getDefaultClientLocale();
      }
      this.logger.debug("Changed client locale to '" + iso + "'");
      this.backend.setHeader('Accept-Language', iso);
      this.user.uiDirection = this.getUiDirection(iso);
      this.user.userSettings.locale = iso;
      if (this.translate.currentLang !== iso || this.system.authData?.language !== iso) {
        const ob = persist
          ? forkJoin([
            this.translate.use(iso),
            this.system.updateLocalizations(iso),
            this.backend.post(UserService.DEFAULT_SETTINGS, this.user.userSettings).pipe(
              tap(() => {
                this.userSource.next(this.user);
                this.logger.debug('Loading system definitions i18n resources for new locale.');
              })
            )
          ])
          : this.translate.use(iso);
        ob.subscribe(() => this.eventService.trigger(YuvEventType.CLIENT_LOCALE_CHANGED, iso));
      }
    }
  }

  fetchUserSettings(): Observable<UserSettings> {
    return this.backend.get('/dms/permissions').pipe(
      catchError((e) => of(undefined)),
      switchMap((res) => {
        this.setUserPermissions(res);
        return this.backend.get(UserService.DEFAULT_SETTINGS);
      })
    );
  }

  private setUserPermissions(res: any): void {
    this.userPermissions = {
      create: this.mapPermissions('CREATE', res),
      write: this.mapPermissions('WRITE', res),
      read: this.mapPermissions('READ', res),
      delete: this.mapPermissions('DELETE', res)
    };
    const sp = {
      createableObjectTypes: [
        ...this.userPermissions.create.folderTypes,
        ...this.userPermissions.create.objectTypes,
        ...this.userPermissions.create.secondaryObjectTypes
      ],
      searchableObjectTypes: [
        ...this.userPermissions.read.folderTypes,
        ...this.userPermissions.read.objectTypes,
        ...this.userPermissions.read.secondaryObjectTypes
      ]
    };
    this.system.setPermissions(sp);
    this.canCreateObjects = sp.createableObjectTypes.length > 0;
  }

  private mapPermissions(section: 'CREATE' | 'READ' | 'WRITE' | 'DELETE', apiResponse: any): UserPermissionsSection {
    const res = apiResponse[section] || {};
    return {
      folderTypes: res['folderTypeIds'] || [],
      objectTypes: res['objectTypeIds'] || [],
      secondaryObjectTypes: res['secondaryObjectTypeIds'] || []
    };
  }

  /**
   * Search for a user based on a search term
   * @param term Search term
   * @param excludeMe whether or not to exclude myself from the result list
   * @param roles narrow down the search results by certain roles
   */
  queryUser(term: string, excludeMe?: boolean, roles?: string[]): Observable<YuvUser[]> {
    let params = new HttpParams().set('search', term).set('excludeMe', `${!!excludeMe}`);
    roles?.length && roles.map((r) => (params = params.append(`roles`, r)));
    return this.backend.get(`/idm/users?${params}`).pipe(map((users) => (!users ? [] : users.map((u) => new YuvUser(u, null)))));
  }

  getUserById(id: string): Observable<YuvUser> {
    return this.backend.get(`/idm/users/${id}`).pipe(map((user) => new YuvUser(user, this.user.userSettings)));
  }

  logout(redirRoute?: string): void {
    if (this.backend.authUsesOpenIdConnect()) {
      this.oidc.logout();
    } else {
      const redir = redirRoute ? `?redir=${redirRoute}` : '';
      (window as any).location.href = `${this.backend.getApiBase('logout')}${redir}`;
    }
  }

  getSettings(section: string): Observable<any> {
    return this.user ? this.backend.get(UserService.USERS_SETTINGS + encodeURIComponent(section)) : of(null);
  }

  saveSettings(section: string, data: any): Observable<any> {
    return this.user ? this.backend.post(UserService.USERS_SETTINGS + encodeURIComponent(section), data) : of(null);
  }

  /**
   * getGlobalSettings
   * @param section
   * @param global
   * @returns
   */
  getGlobalSettings(section: string, global = false): Observable<any> {
    const setting = this.globalSettings.get(section);
    return setting
      ? of(setting)
      : this.backend.get(ConfigService.GLOBAL_RESOURCES_PATH(section)).pipe(
        catchError(() => of({})),
        map((data) => ConfigService.PARSER(data)),
        tap((data) => this.globalSettings.set(section, data))
      );
  }

  /**
   * saveGlobalSettings
   * @param section
   * @param data
   * @param global
   * @returns
   */
  saveGlobalSettings(section: string, data: any, global = false): Observable<any> {
    this.globalSettings.set(section, data);
    return this.backend.post(ConfigService.GLOBAL_RESOURCES_PATH(section, global ? 'system' : 'admin'), data);
  }
}
