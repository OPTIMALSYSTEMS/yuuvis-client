import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApiBase,
  AppCacheService,
  BackendService,
  ConfigService,
  DmsObject,
  DmsService,
  EventService,
  HttpOptions,
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
import { of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { LayoutService } from '../services/layout/layout.service';
import { NotificationService } from '../services/notification/notification.service';
import { PluginAPI, PluginConfigList, PluginViewerConfig } from './plugins.interface';

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
  static LOCAL_PLUGIN_CONFIG = 'yuv.local.plugin-config';
  static RESOURCES_CONFIG = '/resources/config/plugin-config';
  static ADMIN_RESOURCES_CONFIG = '/admin/resources/config/plugin-config';
  static SYSTEM_RESOURCES_CONFIG = '/system/resources/config/plugin-config';

  static EVENT_MODEL_CHANGED = 'yuv.event.object-form.model.changed';

  static VIEWERS: PluginViewerConfig[] = [
    // {
    //   mimeType: ['text/plain'],
    //   viewer: 'api/text/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}'
    // },
    {
      mimeType: ['application/json'],
      viewer:
        'api/monaco/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}&language=javascript'
    },
    {
      mimeType: ['text/plain'],
      viewer: 'api/monaco/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}'
    },
    {
      mimeType: ['text/xml', 'application/xml'],
      viewer: 'api/monaco/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}&language=xml'
    },
    {
      mimeType: ['text/java'],
      viewer:
        'api/monaco/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}&language=java'
    },
    {
      mimeType: ['text/javascript'],
      viewer:
        'api/monaco/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}&language=javascript'
    },
    {
      mimeType: ['text/html'],
      viewer:
        'api/monaco/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}&language=html'
    },
    {
      mimeType: ['text/markdown', 'text/x-web-markdown', 'text/x-markdown'],
      viewer:
        'api/monaco/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}&language=markdown'
    },
    {
      mimeType: ['audio/mp3', 'audio/webm', 'audio/ogg', 'audio/mpeg', 'video/mp4', 'video/webm', 'video/ogg', 'application/ogg'],
      viewer: 'api/video/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}'
    },
    {
      mimeType: ['image/tiff', 'image/jpeg', 'image/png', 'image/apng', 'image/gif', 'image/svg+xml', 'image/webp'],
      viewer: 'api/img/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}'
    },
    {
      mimeType: ['message/rfc822', 'application/vnd.ms-outlook'],
      viewer: 'api/mail/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}'
    },
    {
      mimeType: ['application/pdf'],
      viewer:
        'api/pdf/web/viewer.html?file=&path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}'
    },
    {
      mimeType: [
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.presentationml.template',
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
        'application/vnd.ms-word.document.macroEnabled.12',
        'application/vnd.ms-word.template.macroEnabled.12',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.ms-excel.template.macroEnabled.12',
        'application/vnd.ms-excel.addin.macroEnabled.12',
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        'application/vnd.ms-powerpoint.addin.macroEnabled.12',
        'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
        'application/vnd.ms-powerpoint.template.macroEnabled.12',
        'application/vnd.ms-powerpoint.slideshow.macroEnabled.12'
      ],
      viewer:
        'api/pdf/web/viewer.html?file=&path=${path}&pathPdf=${pathPdf}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}'
    },
    {
      error: true,
      type: 'error',
      viewer: 'api/error/?path=${path}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}'
    },
    {
      type: 'compare',
      viewer: 'api/compare/?compare=${compare}&mimeType=${mimeType}&fileExtension=${fileExtension}&lang=${lang}&theme=${theme}&accentColor=${accentColor}'
    }
  ];

  private pluginConfigs: { local: PluginConfigList; resolved: PluginConfigList; tenant: PluginConfigList; global: PluginConfigList };
  public customPlugins: PluginConfigList;
  private componentRegister = new Map<string, any>();

  public get currentUrl() {
    return this.router.url;
  }

  public get api() {
    return this.getApi();
  }

  public get viewers() {
    return [...(this.customPlugins?.viewers || []), ...PluginsService.VIEWERS];
  }

  public applyFunction(value: string | Function | any, params?: string, args?: any) {
    const fnc = value?.toString().trim();
    if (!fnc) return;
    const f = fnc.match(/^function|^\(.*\)\s*=>/)
      ? `return (${fnc}).apply(this,arguments)`
      : typeof value === 'string' && !fnc.startsWith("'")
      ? `return '${fnc}'`
      : `return ${fnc}`;
    try {
      return new Function(...(params || 'api').split(',').map((a) => a.trim()), f).apply(this.api, args || [this.api]);
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  public resolveViewerParams(params: any, dmsObject: any) {
    const config =
      this.viewers.find((c: any) => {
        const matchMT = !c.mimeType || (typeof c.mimeType === 'string' ? [c.mimeType] : c.mimeType).includes((params?.mimeType || '').toLowerCase());
        const matchFE =
          !c.fileExtension || (typeof c.fileExtension === 'string' ? [c.fileExtension] : c.fileExtension).includes((params?.fileExtension || '').toLowerCase());
        return matchMT && matchFE && (!c.type || c.type === 'default');
      }) || this.viewers.find((c) => c.type === 'error');

    Object.assign(params, this.createSettings());

    params.viewer = this.applyFunction(config?.viewer, 'api, dmsObject, parameters', [this.api, dmsObject, params]);

    const extend = this.viewers.find((c) => c.type === 'extend');
    if (extend) params.viewer = this.applyFunction(extend?.viewer, 'api, dmsObject, parameters', [this.api, dmsObject, params]);

    params.uri = this.resolveUri(params);
    return params;
  }

  private getBaseUrl() {
    const base = this.backend.getApiBase(ApiBase.none, true);
    const viewer = this.backend.getApiBase('viewer', true);
    // default baseUrl in case it is not specified in main.json
    return base === viewer ? base + '/viewer' : viewer;
  }

  private createSettings() {
    const { darkMode, accentColor } = this.layoutService.getLayoutSettings();
    const theme = darkMode === true ? 'dark' : null;
    const user = this.userService.getCurrentUser();
    const direction = user.uiDirection;
    const tenant = user.tenant;
    const lang = user.getClientLocale();
    const baseUrl = this.getBaseUrl();
    return { darkMode, theme, accentColor, direction, lang, tenant, baseUrl };
  }

  public resolveUri(param: any) {
    if (Array.isArray(param)) {
      return this.updateHeaders(
        param.length === 1
          ? param[0].uri
          : this.resolveUri({ ...param[0], viewer: this.viewers.find((v) => v.type === 'compare').viewer, compare: JSON.stringify(param.map((p) => p.uri)) })
      );
    }
    const _path = param.viewer.replace(/\$\{(\w*)\}/g, (a, b) => (b === 'file' ? param[b] || '' : encodeURIComponent(param[b] || '')));
    return _path.match(/^\/|^http/) ? _path : `${param.baseUrl}/view/${_path}`;
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
    private configService: ConfigService,
    private layoutService: LayoutService,
    private appCache: AppCacheService,
    private ngZone: NgZone
  ) {
    window['api'] = this.api;
    this.eventService.on(YuvEventType.CLIENT_LOCALE_CHANGED).subscribe((event: any) => this.extendTranslations(event.data));
  }

  extendTranslations(lang: string = this.translate.currentLang) {
    const translations = this.customPlugins?.translations?.[lang] || this.customPlugins?.translations?.[lang.substring(0, 2)];
    translations && this.configService.extendTranslations(translations, lang);
  }

  private loadCustomPlugins(force = false) {
    return this.userService.user$
      .pipe(filter((v) => !!v))
      .pipe(take(1))
      .pipe(switchMap((user) => this.backend.get(PluginsService.RESOURCES_CONFIG).pipe(catchError(() => of({})))))
      .pipe(
        map((config: any) => {
          const p = (this.pluginConfigs = {
            local: JSON.parse(localStorage.getItem(PluginsService.LOCAL_PLUGIN_CONFIG) || '{}'),
            ...(config || {})
          });
          if (!this.customPlugins || force) {
            this.customPlugins = { ...ConfigService.PARSER(p), ...p.local };
            this.extendTranslations(this.translate.currentLang);
            this.run(this.customPlugins?.load);
          }
          return this.customPlugins;
        })
      );
  }

  public getCustomPlugins(type: 'links' | 'states' | 'actions' | 'extensions' | 'triggers' | 'viewers', hook?: string, matchPath?: string | RegExp) {
    return (!this.customPlugins ? this.backend.getViaTempCache('_plugins', () => this.loadCustomPlugins()) : of(this.customPlugins)).pipe(
      map((cp: PluginConfigList) => {
        if (this.run(cp.disabled)) return [];
        const customPlugins: any[] = type === 'links' ? [...(cp.links || []), ...(cp.states || [])] : cp[type] || [];
        return customPlugins.filter(
          (p) =>
            !this.run(p.disabled) &&
            (hook ? p.matchHook && hook.match(new RegExp(p.matchHook)) : matchPath ? (p.path || '').match(new RegExp(matchPath)) : true)
        );
      })
    );
  }

  private run(fnc: any) {
    return this.applyFunction(fnc && fnc.toString(), 'api, currentState', [this.api, this.router.routerState.snapshot]);
  }

  public disableCustomPlugins(disabled = true) {
    this.customPlugins = { ...this.customPlugins, disabled: disabled.toString() };
    this.pluginConfigs = { ...this.pluginConfigs, local: { ...this.pluginConfigs.local, disabled: disabled.toString() } };
    !disabled && delete this.pluginConfigs.local.disabled;
    return of((localStorage[PluginsService.LOCAL_PLUGIN_CONFIG] = JSON.stringify(this.pluginConfigs.local || {})));
  }

  public register(component: any) {
    return component?.id && this.componentRegister.set(component?.id, component);
  }

  public unregister(component: any) {
    return component?.id && this.componentRegister.delete(component?.id);
  }

  public validateUrl(src: string) {
    if (!window['api']?.allowHeaders) return src;
    // validate/update authorization token
    const reg = new RegExp(encodeURIComponent('.*"(Bearer .*)"'));
    const token = src?.match(reg)?.[1];
    const authorization = encodeURIComponent(this.configService.getAuthHeaders(true).authorization);
    return token && token !== authorization ? src.replace(new RegExp(token, 'g'), authorization) : src;
  }

  public updateHeaders(src: string) {
    if (!window['api']?.allowHeaders) return src;
    return src && this.configService.authUsesOpenIdConnect()
      ? src.replace(/&headers=.*/, '') + '&headers=' + encodeURIComponent(JSON.stringify(this.configService.getAuthHeaders(true)))
      : src;
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
          hasManageSettingsRole: () => this.userService.hasManageSettingsRole,
          hasAdvancedUserRole: () => this.userService.isAdvancedUser
        }
      },
      dms: {
        getObject: (id, version) => this.getDmsObject(id, version),
        getResult: (fields, type) => this.getResult(fields, type),
        downloadContent: (dmsObjects: DmsObject[]) => this.dmsService.downloadContent(dmsObjects)
      },
      http: {
        get: (uri, base, options) => this.get(uri, base, options),
        post: (uri, data, base, options) => this.post(uri, data, base, options),
        del: (uri, base, options) => this.del(uri, base, options),
        put: (uri, data, base, options) => this.put(uri, data, base, options)
      },
      form: {
        activeForms: () => [...this.componentRegister.values()].filter((v) => v.id.startsWith('#form_')),
        getValue: (formControlName) => this.api.form.activeForms().reduce((prev, cur) => ({ ...prev, ...(cur.formData || {}) }), {})[formControlName],
        setValue: (formControlName, newValue) => this.api.form.modelChange(formControlName, { name: 'value', newValue }),
        modelChange: (formControlName, change) =>
          this.ngZone.run(() =>
            this.eventService.trigger(PluginsService.EVENT_MODEL_CHANGED, {
              formControlName,
              change
            })
          )
      },
      content: {
        viewer: () => window[UNDOCK_WINDOW_NAME] || (window.document.querySelector('yuv-content-preview iframe') || {})['contentWindow'],
        triggerError: (err, win, parameters) => this.ngZone.run(() => this.eventService.trigger(UNDOCK_WINDOW_NAME + 'Error', { err, win, parameters })),
        catchError: () => this.ngZone.run(() => this.eventService.on(UNDOCK_WINDOW_NAME + 'Error')),
        resolveViewerParams: (parameters, dmsObject) => this.resolveViewerParams(parameters, dmsObject),
        validateUrl: (uri) => this.validateUrl(uri)
      },
      storage: {
        getItem: (key) => this.appCache.getItem(key).toPromise(),
        setItem: (key, value) => this.appCache.setItem(key, value).toPromise()
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
  public get(uri, base?, options?: HttpOptions) {
    return this.backend
      .get(uri, base || ApiBase.none, options || { observe: 'response' })
      .pipe(
        map((res: any) => {
          return options ? res : { status: res.status, data: res.body };
        })
      )
      .toPromise();
  }

  /**
   * @ignore
   */
  public put(uri, data, base?, options?: HttpOptions) {
    return this.backend.put(uri, data, base || ApiBase.none, options).toPromise();
  }

  /**
   * @ignore
   */
  public post(uri, data, base?, options?: HttpOptions) {
    return this.backend.post(uri, data, base || ApiBase.none, options).toPromise();
  }

  /**
   * @ignore
   */
  public del(uri, base?, options?: HttpOptions) {
    return this.backend.delete(uri, base || ApiBase.none, options).toPromise();
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
