import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BackendService,
  DmsObject,
  DmsService,
  EventService,
  Logger,
  SearchFilter,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchService,
  SystemService,
  TranslateService,
  UserService,
  Utils,
  YuvUser
} from '@yuuvis/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PluginsService {
  private user: YuvUser;

  constructor(
    private backend: BackendService,
    // private notifications: NotificationsService,
    // private clipboard: ClipboardService,
    private logger: Logger,
    public translate: TranslateService,
    private dmsService: DmsService,
    private systemService: SystemService,
    private router: Router,
    // private agentService: AgentService,
    private eventService: EventService,
    private searchService: SearchService,
    private userService: UserService
  ) {
    this.userService.user$.subscribe(user => (this.user = user));
  }

  // todo: create inreface for API

  public getApi(): any {
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
        getObject: (id, type, version) => this.getDmsObject(id, type, version),
        getResult: (fields, type) => this.getResult(fields, type),
        downloadContent: (dmsObjects: DmsObject[]) => this.backend.downloadContent(dmsObjects.map(o => o.id))
      },
      http: {
        get: (uri, base) => this.get(uri, base),
        post: (uri, data, base) => this.post(uri, data, base),
        del: (uri, base) => this.del(uri, base),
        put: (uri, data, base) => this.put(uri, data, base)
      },
      config: {
        get: () => this.getConfig()
      },
      util: {
        translate: key => this.translate.instant(key),
        encodeFileName: filename => this.encodeFileName(filename)
        // notifier: {
        //   success: (text, title) => this.notifications.success(title, text),
        //   error: (text, title) => this.notifications.error(title, text),
        //   info: (text, title) => this.notifications.info(title, text),
        //   warning: (text, title) => this.notifications.warning(title, text)
        // }
      }
      // clipboard: {
      //   set: (elements: DmsObject[], action: ClipboardAction) => this.clipboard.set(elements, action),
      //   get: () => this.clipboard.get(),
      //   clear: () => this.clipboard.clear()
      // },
      // // Agent
      // agent: {
      //   getAvailability: () => this.getAgentAvailability(),
      //   executeAction: (action, args) => this.executeAgentAction(action, args),
      //   action: this.agentAction
      // }
    };
  }

  public get(uri, base = '') {
    return this.backend
      .get(uri, this.backend.getHost() + base, { observe: 'response' })
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

  public put(uri, data, base = '') {
    return this.backend.put(uri, data, this.backend.getHost() + base).toPromise();
  }

  public post(uri, data, base = '') {
    return this.backend.post(uri, data, this.backend.getHost() + base).toPromise();
  }

  public del(uri, base = '') {
    return this.backend.delete(uri, this.backend.getHost() + base).toPromise();
  }

  public getCurrentUser(): YuvUser {
    return this.user;
  }

  public encodeFileName(filename) {
    return Utils.encodeFileName(filename);
  }

  public getConfig() {
    return {};
  }

  /**
   * fetches dms objects from the server that match the given params
   *
   * @param fields - the fields to match. example: {name: 'max', plz: '47111}
   * @param type - the target object type
   *
   * @returns which will be resolved by an array of DmsObjects matching the given params
   */
  public getResult(fields, type): Promise<DmsObject[]> {
    const searchQuery = new SearchQuery();
    Object.keys(fields).forEach(f => {
      searchQuery.addFilter(new SearchFilter(f, SearchFilter.OPERATOR.EQUAL, fields[f]));
    });
    searchQuery.addType(type);
    return this.searchService
      .search(searchQuery)
      .toPromise()
      .then((res: SearchResult) => {
        return Promise.resolve(
          res.items.map((resItem: SearchResultItem) => {
            new DmsObject(resItem, this.systemService.getObjectType(type).isFolder);
          })
        );
      })
      .catch(this.handleError);
  }

  /**
   * Loads a DMS object from the backend.
   *
   * @param id - The id of the DMS-Object to be fetched.
   * @param [type] - The object type of the selected DMS-Object. Will improve performance if set.
   * @param [version] - retrieve a specific version of the dms object
   *
   * @returns which will be resolved by the DMS object fetched from the server
   */
  public getDmsObject(id, type, version): Promise<DmsObject> {
    return this.dmsService
      .getDmsObject(id, type, version)
      .toPromise()
      .then(response => {
        return Promise.resolve(response);
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
