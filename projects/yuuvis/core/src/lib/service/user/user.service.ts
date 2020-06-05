import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserSettings, YuvUser } from '../../model/yuv-user.model';
import { BackendService } from '../backend/backend.service';
import { Direction } from '../config/config.interface';
import { ConfigService } from '../config/config.service';
import { EventService } from '../event/event.service';
import { YuvEventType } from '../event/events';
import { Logger } from '../logger/logger';
import { AdministrationRoles } from '../system/system.enum';
import { SystemService } from '../system/system.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  USER_FETCH_URI = '/user/whoami';
  private user: YuvUser = null;
  private userSource = new BehaviorSubject<YuvUser>(this.user);
  user$: Observable<YuvUser> = this.userSource.asObservable();

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
    return new RegExp(AdministrationRoles.ADMIN).test(this.user.authorities.join(','));
  }

  get hasSystemRole(): boolean {
    return new RegExp(AdministrationRoles.SYSTEM).test(this.user.authorities.join(','));
  }

  get hasAdministrationRoles(): boolean {
    return this.hasAdminRole || this.hasSystemRole;
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
    // TODO: implement once service is available
    const dummyData = [
      {
        username: 'martin',
        id: '2685df3a-1cf8-4da3-968c-0a4a10b48921',
        type: 'USER',
        email: 'bartonitz@optimal-systems.de',
        firstname: 'Martin',
        lastname: 'Bartonitz',
        enabled: true
      },
      {
        username: 'jürgen',
        id: '75c3d8ba-2818-4064-a761-997143a4db43',
        type: 'USER',
        email: 'widiker@optimal-systems.de',
        firstname: 'Jürgen',
        lastname: 'Widiker',
        enabled: true
      },
      {
        username: 'frank',
        id: 'b74225f6-f8f2-4cb6-aa84-c00a34b8b8b1',
        type: 'USER',
        email: 'frank.klingebiel@optimal-systems.de',
        firstname: 'Frank',
        lastname: 'Klingebiel',
        enabled: true
      },
      {
        username: 'andreas',
        id: 'a69a0eb6-3662-4c00-8096-38fbb2c4a922',
        type: 'USER',
        email: 'schulz@optimal-systems.de',
        firstname: 'Andreas',
        lastname: 'Schulz',
        enabled: true
      }
    ];
    return of(dummyData.map((d) => new YuvUser(d, null)).filter((d) => d.firstname.includes(term) || d.lastname.includes(term) || d.email.includes(term)));
  }

  getUserById(id: string): Observable<YuvUser> {
    return this.backend.get(`/user/${id}/info`).pipe(map((user) => new YuvUser(user, this.user.userSettings)));
  }

  logout(): void {
    (window as any).location.href = '/logout';
  }
}
