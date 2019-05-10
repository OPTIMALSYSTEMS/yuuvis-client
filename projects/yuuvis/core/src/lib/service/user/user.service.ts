import { Injectable } from '@angular/core';
import { YuvUser } from '../../model/yuv-user.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BackendService } from '../backend/backend.service';
import { Logger } from '../logger/logger';
import { TranslateService } from '@ngx-translate/core';
import { SystemService } from '../system/system.service';
import { Direction } from '../config/config.interface';
import { ConfigService } from '../config/config.service';
import { EventService } from '../event/event.service';
import { YuvEventType } from '../event/events';
import { tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  USER_FETCH_URI = '/user/whoami';
  private user: YuvUser = null;
  private userSource = new BehaviorSubject<YuvUser>(this.user);
  user$: Observable<YuvUser> = this.userSource.asObservable();

  constructor(private backend: BackendService,
    private translate: TranslateService,
    private logger: Logger,
    private system: SystemService,
    private eventService: EventService,
    private config: ConfigService) { }

  /**
     * Set a new current user
     * @param user The user to be set as current user
     */
  public setCurrentUser(user: YuvUser) {
    this.user = user;
    // this.user.setImageBase(this.backend.getServiceBase());
    this.backend.setHeader('Accept-Language', this.user.getSchemaLocale());

    const languages = this.config.getClientLocales().map(lang => lang.iso);
    const userLang = user.getClientLocale();
    if (languages.indexOf(userLang) !== -1) {
      this.logger.debug('Setting client locale to \'' + userLang + '\'');
      this.translate.use(userLang);
      this.user.uiDirection = (this.config.getClientLocales().find(l => l.iso === userLang) || {}).dir || Direction.LTR;
    }
    this.userSource.next(this.user);
  }

  getCurrentUser(): YuvUser {
    return this.user;
  }

  /**
   * Change the users client locale
   * @param iso ISO locale string to be set as new client locale
   */
  changeClientLocale(iso: string): void {
    this.user.userSettings.locales.client = iso;
    // TODO: store user settings once this feature is available
    of(true)
    // this.backend.put('/user/config/web', this.user.userSettings)
      .subscribe(() => {
        this.logger.debug('Changed client locale to \'' + iso + '\'');
        this.translate.use(iso);
        this.user.uiDirection = (this.config.getClientLocales().find(l => l.iso === iso) || {}).dir || Direction.LTR;
        this.userSource.next(this.user);
        this.eventService.trigger(YuvEventType.CLIENT_LOCALE_CHANGED, iso);
      });
  }

  /**
   * Change the users schema locale
   * @param iso ISO locale string to be set as new schema locale
   */
  changeSchemaLocale(iso: string): void {

    if (this.user.userSettings.locales.schema !== iso) {

      this.user.userSettings.locales.schema = iso;
      // TODO: store user settings once this feature is available
      // return this.backend.put('/user/locale/' + this.user.getSchemaLocale())
      of(true)
        .pipe(
          switchMap(() => {
            this.logger.debug('Changed schema locale to \'' + iso + '\'');
            this.userSource.next(this.user);
            this.backend.setHeader('Accept-Language', this.user.getSchemaLocale());
            this.logger.debug('Loading system definitions i18n resources for new locale.');
            return this.system.updateLocalizations(this.user);
          }),
          tap(() => {
            this.eventService.trigger(YuvEventType.SCHEMA_LOCALE_CHANGED, iso);
          })
        );
    }
  }
}
