import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserSettings, YuvUser } from '../../model/yuv-user.model';
import { BackendService } from '../backend/backend.service';
import { Direction } from '../config/config.interface';
import { ConfigService } from '../config/config.service';
import { EventService } from '../event/event.service';
import { YuvEventType } from '../event/events';
import { Logger } from '../logger/logger';
import { AdministrationRoles } from '../system/system.enum';
import { SystemService } from '../system/system.service';
/**
 * Service providing user account configurations.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  USER_FETCH_URI = '/user/whoami';
  private user: YuvUser = null;
  private userSource = new BehaviorSubject<YuvUser>(this.user);
  user$: Observable<YuvUser> = this.userSource.asObservable();

  globalSettings = new Map();
  /**
   * @ignore
   */
  constructor(
    private backend: BackendService,
    private translate: TranslateService,
    private logger: Logger,
    private system: SystemService,
    private eventService: EventService,
    private config: ConfigService
  ) {}

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
    // this.user.setImageBase(this.backend.getServiceBase());
    if (user) {
      this.backend.setHeader('Accept-Language', this.user.getClientLocale());

      const languages = this.config.getClientLocales().map((lang) => lang.iso);
      const userLang = user.getClientLocale();
      if (languages.indexOf(userLang) !== -1) {
        this.logger.debug("Setting client locale to '" + userLang + "'");
        this.translate.use(userLang);
        this.user.uiDirection = this.getUiDirection(userLang);
      }
    }
    this.userSource.next(this.user);
  }

  getCurrentUser(): YuvUser {
    return this.user;
  }

  get hasAdminRole(): boolean {
    return new RegExp(AdministrationRoles.ADMIN).test(this.user?.authorities.join(','));
  }

  get hasSystemRole(): boolean {
    return new RegExp(AdministrationRoles.SYSTEM).test(this.user?.authorities.join(','));
  }

  get hasAdministrationRoles(): boolean {
    return this.hasAdminRole || this.hasSystemRole;
  }

  get hasManageSettingsRole(): boolean {
    return new RegExp(AdministrationRoles.MANAGE_SETTINGS).test(this.user?.authorities.join(','));
  }

  /**
   * Change the users client locale
   * @param iso ISO locale string to be set as new client locale
   */
  changeClientLocale(iso: string): void {
    if (this.user.userSettings.locale !== iso) {
      this.user.userSettings.locale = iso;

      this.backend
        .post('/user/settings', this.user.userSettings)
        .pipe(
          switchMap(() => {
            this.backend.setHeader('Accept-Language', iso);
            this.logger.debug("Changed client locale to '" + iso + "'");
            this.translate.use(iso);
            this.user.uiDirection = this.getUiDirection(iso);
            this.userSource.next(this.user);
            this.logger.debug('Loading system definitions i18n resources for new locale.');
            return this.system.updateLocalizations();
          })
        )
        .subscribe(() => {
          this.eventService.trigger(YuvEventType.CLIENT_LOCALE_CHANGED, iso);
        });
    }
  }

  setUserLocale(locale: string): string {
    if (locale) {
      this.changeClientLocale(this.config.getDefaultClientLocale());
      return this.config.getDefaultClientLocale();
    }
    return locale;
  }

  fetchUserSettings(): Observable<UserSettings> {
    return this.backend.get('/user/settings');
  }

  /**
   * Search for a user based on a search term
   * @param term Search term
   */
  queryUser(term: string): Observable<YuvUser[]> {
    return this.backend.get(`/user/users?search=${term}`).pipe(map((users) => (!users ? [] : users.map((u) => new YuvUser(u, null)))));
  }

  getUserById(id: string): Observable<YuvUser> {
    return this.backend.get(`/user/${id}/info`).pipe(map((user) => new YuvUser(user, this.user.userSettings)));
  }

  logout(redirRoute?: string): void {
    const redir = redirRoute ? `?redir=${redirRoute}` : '';
    (window as any).location.href = `/logout${redir}`;
  }

  getSettings(section: string): Observable<any> {
    return this.backend.get('/user/settings/' + section);
  }

  saveSettings(section: string, data: any): Observable<any> {
    return this.backend.post('/user/settings/' + section, data);
  }

  getGlobalSettings(section: string): Observable<any> {
    const setting = this.globalSettings.get(section);
    return setting ? of(setting) : this.backend.get('/user/globalsettings/' + section).pipe(tap((data) => this.globalSettings.set(section, data)));
  }

  saveGlobalSettings(section: string, data: any): Observable<any> {
    this.globalSettings.set(section, data);
    return this.backend.post('/user/globalsettings/' + section, data);
  }
}
