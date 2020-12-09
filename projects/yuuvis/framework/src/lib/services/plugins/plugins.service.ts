import { CommonModule } from '@angular/common';
import { Component, Injectable, Input, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';
import { YuvPipesModule } from './../../pipes/pipes.module';
import { PluginAPI } from './plugins.interface';

@Component({
  selector: 'yuv-plugin',
  template: `<iframe *ngIf="config?.viewer" [src]="config?.viewer | safeUrl" width="100%" height="100%" frameborder="0"></iframe>`,
  styleUrls: [],
  providers: []
})
export class PluginComponent implements OnInit {
  @Input() config: any;
  constructor(private pluginsService: PluginsService, private route: ActivatedRoute) {}

  ngOnInit() {
    if (!this.config) {
      // match custom state by url
      const path = this.route.snapshot.url.map((u) => u.toString()).join('/');
      this.pluginsService.getViewerPlugins('states', '', path).subscribe((res) => (this.config = res[0]));
    }
  }
}

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
  private user: YuvUser;
  private viewerPlugins: any;

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
    private userService: UserService
  ) {
    // this.getViewerPlugins('links').subscribe(); // initial call to speed up loading process
    this.userService.user$.subscribe((user) => (this.user = user));
    this.eventService.on(YuvEventType.CLIENT_LOCALE_CHANGED).subscribe((event: any) => this.extendTranslations(event.data));
  }

  private extendTranslations(lang: string) {
    const translations = (this.viewerPlugins?.translations || {})[lang];
    const allKeys = translations && Object.keys(this.translate.store?.translations[lang] || {});
    if (translations && !Object.keys(translations).every((k) => allKeys.includes(k))) {
      this.translate.setTranslation(lang, translations, true);
    }
  }

  getViewerPlugins(type: 'links' | 'states' | 'actions' | 'plugins', matchType?: string, matchPath?: string) {
    return (!this.viewerPlugins ? this.backend.getViaTempCache('viewer/plugins', () => this.backend.get('viewer/plugins', '')) : of(this.viewerPlugins)).pipe(
      catchError(() => {
        console.warn('Missing plugin service!');
        return of({});
      }),
      tap((res) => {
        if (!this.viewerPlugins) {
          this.viewerPlugins = res || {};
          this.extendTranslations(this.translate.currentLang);

          // TODO: why it doesnt work ???
          // this.getViewerPlugins('states').forEach((state) => {
          // debugger;
          // const config = this.router.config;
          // config.push({ path: state.path, component: PluginComponent });
          // this.router.resetConfig(config);
          // });
        }
      }),
      map((res) => {
        const viewerPlugins = type === 'links' ? [...(this.viewerPlugins.links || []), ...(this.viewerPlugins.states || [])] : this.viewerPlugins[type] || [];
        return viewerPlugins.filter((p) =>
          matchType ? p.matchType && matchType.match(new RegExp(p.matchType)) : matchPath ? (p.path || '').match(new RegExp(matchPath)) : true
        );
      })
    );
  }

  /**
   * Returns plugin API
   */
  public getApi(): PluginAPI {
    return {
      router: {
        get: () => this.router
      },
      events: {
        on: (type: string) => this.eventService.on(type),
        trigger: (type: string, data?: any) => this.eventService.trigger(type, data)
      },
      session: {
        getUser: () => this.getCurrentUser()
      },
      dms: {
        getObject: (id, version) => this.getDmsObject(id, version),
        getResult: (fields, type) => this.getResult(fields, type),
        downloadContent: (dmsObjects: DmsObject[]) => this.backend.downloadContent(dmsObjects)
      },
      http: {
        get: (uri, base) => this.get(uri, base),
        post: (uri, data, base) => this.post(uri, data, base),
        del: (uri, base) => this.del(uri, base),
        put: (uri, data, base) => this.put(uri, data, base)
      },
      util: {
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
    return this.user;
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

@NgModule({
  imports: [CommonModule, YuvPipesModule],
  declarations: [PluginComponent],
  exports: [PluginComponent],
  providers: [PluginsService]
})
export class YuvPluginsModule {}
