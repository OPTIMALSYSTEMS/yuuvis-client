import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApiBase,
  BackendService,
  DmsObject,
  DmsService,
  EventService,
  SearchFilter,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchService,
  SystemService,
  TranslateService,
  UserService,
  Utils,
  YuvEventType,
  YuvUser
} from '@yuuvis/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NotificationService } from '../services/notification/notification.service';
import { PluginAPI, PluginConfigList } from './plugins.interface';

export const UNDOCK_WINDOW_NAME = 'eoViewer';
/**
 * `PluginService` is an abstraction of some framework capabilities that is aimed towards
 * providing plugin developers with a convenient and reliable interface. This service and the
 * API it provides will be stable across the different versions of the framework.
 *
 * `PluginService` API is also injected into form scripts.
 */
@Injectable({
  providedIn: 'root'
})
export class PluginsService {
  static LOCAL_PLUGIN_CONFIG = '/users/settings/plugin-config';
  static RESOURCES_CONFIG = '/resources/config/plugin-config';
  static ADMIN_RESOURCES_CONFIG = '/admin/resources/config/plugin-config';
  static SYSTEM_RESOURCES_CONFIG = '/system/resources/config/plugin-config';

  static EVENT_MODEL_CHANGED = 'yuv.event.object-form.model.changed';

  private pluginConfigs: { local: PluginConfigList; tenant: PluginConfigList; global: PluginConfigList };
  public customPlugins: PluginConfigList;
  private componentRegister = new Map<string, any>();

  public get currentUrl() {
    return this.router.url;
  }

  public get api() {
    return this.getApi();
  }

  public applyFunction(fnc: string | Function, params?: string, args?: any) {
    fnc = fnc?.toString().trim();
    if (!fnc) return;
    const f = fnc.match(/^function|^\(.*\)\s*=>/) ? `return (${fnc}).apply(this,arguments)` : !fnc.startsWith('return') ? `return ${fnc}` : fnc;
    return new Function(...(params || 'api').split(',').map((a) => a.trim()), f).apply(this.api, args || [this.api]);
  }

  /**
   * @ignore
   */
  constructor(
    private backend: BackendService,
    private notifications: NotificationService,
    public translate: TranslateService,
    private dmsService: DmsService,
    private systemService: SystemService,
    private router: Router,
    private eventService: EventService,
    private searchService: SearchService,
    private userService: UserService,
    private ngZone: NgZone
  ) {
    window['api'] = this.api;
    this.eventService.on(YuvEventType.CLIENT_LOCALE_CHANGED).subscribe((event: any) => this.extendTranslations(event.data));
  }

  extendTranslations(lang: string = this.translate.currentLang) {
    const translations = (this.customPlugins?.translations || {})[lang];
    const allKeys = translations && Object.keys(this.translate.store?.translations[lang] || {});
    if (translations && !Object.keys(translations).every((k) => allKeys.includes(k))) {
      this.translate.setTranslation(lang, translations, true);
    }
  }

  private loadCustomPlugins(force = false) {
    return forkJoin([
      this.backend.get(PluginsService.LOCAL_PLUGIN_CONFIG).pipe(catchError(() => of({}))),
      this.backend.get(PluginsService.RESOURCES_CONFIG).pipe(catchError(() => of({})))
    ]).pipe(
      map(([local, config]) => {
        const p = (this.pluginConfigs = { local, tenant: config?.tenant || {}, global: config?.global || {} });
        if (!this.customPlugins || force) {
          // merge configs: global >> tenant >> local
          this.customPlugins = [p.global, p.tenant, p.local].reduce((prev, cur) => {
            Object.keys(cur || {}).forEach((k) => {
              if (Array.isArray(cur[k])) {
                prev[k] = cur[k].concat((prev[k] || []).filter((p) => !cur[k].find((c) => c.id === p.id)));
              } else if (k === 'translations' && prev[k]) {
                Object.keys(cur[k]).forEach((t) => (prev[k][t] = { ...(prev[k][t] || {}), ...cur[k][t] }));
              } else {
                prev[k] = cur[k];
              }
            });
            return prev;
          }, {});
          this.extendTranslations(this.translate.currentLang);
        }
        return this.customPlugins;
      })
    );
  }

  public getCustomPlugins(type: 'links' | 'states' | 'actions' | 'extensions' | 'triggers' | 'viewers', hook?: string, matchPath?: string | RegExp) {
    return (!this.customPlugins ? this.backend.getViaTempCache('_plugins', () => this.loadCustomPlugins()) : of(this.customPlugins)).pipe(
      map((cp) => {
        if (this.isDisabled(cp.disabled)) return [];
        const customPlugins = type === 'links' ? [...(cp.links || []), ...(cp.states || [])] : cp[type] || [];
        return customPlugins.filter(
          (p) =>
            !this.isDisabled(p.disabled) &&
            (hook ? p.matchHook && hook.match(new RegExp(p.matchHook)) : matchPath ? (p.path || '').match(new RegExp(matchPath)) : true)
        );
      })
    );
  }

  private isDisabled(disabled: any) {
    return this.applyFunction(disabled && disabled.toString(), 'api, currentState', [this.api, this.router.routerState.snapshot]);
  }

  public disableCustomPlugins(disabled = true) {
    this.customPlugins = { ...this.customPlugins, disabled: !!disabled };
    this.pluginConfigs = { ...this.pluginConfigs, local: { ...this.pluginConfigs.local, disabled: !!disabled } };
    return this.backend.post(PluginsService.LOCAL_PLUGIN_CONFIG, this.pluginConfigs.local);
  }

  public register(component: any) {
    return component?.id && this.componentRegister.set(component?.id, component);
  }

  /**
   * Returns plugin API
   */
  public getApi(): PluginAPI {
    return {
      components: {
        get: (id) => this.componentRegister.get(id),
        getParent: (id) => this.componentRegister.get(id)?.parent
      },
      router: {
        get: () => this.ngZone.run(() => this.router),
        navigate: (commands, extras) => this.ngZone.run(() => this.router.navigate(commands, extras))
      },
      events: {
        yuuvisEventType: YuvEventType,
        on: (type: string) => this.ngZone.run(() => this.eventService.on(type)),
        trigger: (type: string, data?: any) => this.ngZone.run(() => this.eventService.trigger(type, data))
      },
      session: {
        getUser: () => this.getCurrentUser(),
        user: {
          get: () => this.getCurrentUser(),
          hasRole: (role: string) => this.getCurrentUser().authorities?.includes(role) || false,
          hasAdminRole: () => this.userService.hasAdminRole,
          hasSystemRole: () => this.userService.hasSystemRole,
          hasAdministrationRoles: () => this.userService.hasAdministrationRoles,
          hasManageSettingsRole: () => this.userService.hasManageSettingsRole
        }
      },
      dms: {
        getObject: (id, version) => this.getDmsObject(id, version),
        getResult: (fields, type) => this.getResult(fields, type),
        downloadContent: (dmsObjects: DmsObject[]) => this.dmsService.downloadContent(dmsObjects)
      },
      http: {
        get: (uri, base) => this.get(uri, base),
        post: (uri, data, base) => this.post(uri, data, base),
        del: (uri, base) => this.del(uri, base),
        put: (uri, data, base) => this.put(uri, data, base)
      },
      form: {
        modelChange: (formControlName, change) =>
          this.ngZone.run(() =>
            this.eventService.trigger(PluginsService.EVENT_MODEL_CHANGED, {
              formControlName,
              change
            })
          )
      },
      content: {
        viewer: () => window[UNDOCK_WINDOW_NAME] || (window.document.querySelector('yuv-content-preview iframe') || {})['contentWindow']
      },
      util: {
        $: (selectors, element) => (element || window.document).querySelector(selectors),
        $$: (selectors, element) => (element || window.document).querySelectorAll(selectors),
        styles: (styles, id = '__styles', win: any = window) => {
          let s = win.document.head.querySelector('#' + id);
          if (!s) {
            s = win.document.createElement('style');
            s.setAttribute('id', id);
            win.document.head.appendChild(s);
          }
          s.innerHTML = styles;
        },
        translate: (key, data) => this.translate.instant(key, data),
        encodeFileName: (filename) => this.encodeFileName(filename),
        notifier: {
          success: (text, title) => this.notifications.success(title, text),
          error: (text, title) => this.notifications.error(title, text),
          info: (text, title) => this.notifications.info(title, text),
          warning: (text, title) => this.notifications.warning(title, text)
        }
      }
    };
  }

  /**
   * @ignore
   */
  public get(uri, base?) {
    return this.backend
      .get(uri, base || ApiBase.none, { observe: 'response' })
      .pipe(
        map((res: any) => {
          const { status, body } = res;
          return {
            status,
            data: body
          };
        })
      )
      .toPromise();
  }

  /**
   * @ignore
   */
  public put(uri, data, base?) {
    return this.backend.put(uri, data, base || ApiBase.none).toPromise();
  }

  /**
   * @ignore
   */
  public post(uri, data, base?) {
    return this.backend.post(uri, data, base || ApiBase.none).toPromise();
  }

  /**
   * @ignore
   */
  public del(uri, base?) {
    return this.backend.delete(uri, base || ApiBase.none).toPromise();
  }

  /**
   * @ignore
   */
  public getCurrentUser(): YuvUser {
    return this.userService.getCurrentUser();
  }

  /**
   * @ignore
   */
  public encodeFileName(filename) {
    return Utils.encodeFileName(filename);
  }

  /**
   * fetches dms objects from the server that match the given params
   *
   * @param fields - the fields to match. example: {name: 'max', plz: '47111}
   * @param type - the target object type
   * @ignore
   */
  public getResult(fields, type): Promise<DmsObject[]> {
    const searchQuery = new SearchQuery();
    Object.keys(fields).forEach((f) => {
      searchQuery.addFilter(new SearchFilter(f, SearchFilter.OPERATOR.EQUAL, fields[f]));
    });
    searchQuery.addType(type);
    return this.searchService
      .search(searchQuery)
      .toPromise()
      .then((res: SearchResult) => {
        return Promise.resolve(
          res.items.map((resItem: SearchResultItem) => {
            new DmsObject(resItem, this.systemService.getObjectType(type));
          })
        );
      })
      .catch(this.handleError);
  }

  /**
   * Loads a DMS object from the backend.
   *
   * @param id The id of the DMS-Object to be fetched.
   * @param version Retrieve a specific version of the dms object
   *
   * @ignore
   */
  public getDmsObject(id, version): Promise<DmsObject> {
    return this.dmsService
      .getDmsObject(id, version)
      .toPromise()
      .then((response) => {
        return Promise.resolve(response);
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
