import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiBase, AppCacheService, BackendService, UserService, Utils, YuvUser } from '@yuuvis/core';
import { Observable } from 'rxjs';

/**
 * This service is used for sharing data across the clients states (pages).
 * If one state needs to store some data that later will be required by a differnt
 * state, it can use this service. Data will not be persisted. Refreshing the
 * browser will clear all items.
 *
 * If you added an item calling `addItem(...)` it will be available until calling
 * `getItem(...)`. So you can get items only once.
 * Once you got the item, it will be removed from the service. This way
 * you don't have to care about cleaning up.
 */
@Injectable({
  providedIn: 'root'
})
export class FrameService {
  private items: Map<string, any> = new Map<string, any>();
  private APP_LOGOUT_EVENT_KEY = 'yuv.app.event.logout';

  constructor(private router: Router, private userService: UserService, private appCache: AppCacheService, private backend: BackendService) {
    window.addEventListener('storage', (evt) => {
      if (evt.key === this.APP_LOGOUT_EVENT_KEY) {
        this.appLogout(true);
      }
    });
  }

  /**
   * Add temporary data item.
   * @param id ID to store the item under
   * @param item The item to be stored
   */
  addItem(id: string, item: any) {
    this.items.set(id, item);
  }

  /**
   * Get a temporary data item. This will remove the item from the
   * service. Will return NULL if nothing could be found,
   * @param id ID of the item
   */
  getItem(id: string) {
    const item = this.items.get(id);
    if (item) {
      this.items.delete(id);
    }
    return item ? item : null;
  }

  /**
   * Trigger creation of a new object.
   * @param context ID of a context folder to add the new object to
   * @param files Array of files to be used when creating the new object
   */
  createObject(context?: string, files?: File[]) {
    let params = {};

    if (context) {
      params['context'] = context;
    }
    if (files) {
      // store the files and provide a refID so the create state can access
      // these files
      const refId = Utils.uuid();
      this.addItem(refId, files);
      params['filesRef'] = refId;
    }
    this.router.navigate(['/create'], { queryParams: params });
  }

  getAppRootPath(): string {
    let root = this.backend.getApiBase(ApiBase.none, true);
    return `${root}${Utils.getBaseHref()}`;
  }

  // logout triggered by the app (or the apps auth interceptor)
  appLogout(triggeredFromOtherTab?: boolean) {
    if (!triggeredFromOtherTab) {
      // persist the current route to be able to enter it again once the user logs back in
      this.appCache
        .setItem(this.getRouteOnLogoutStorageKey(), {
          uri: this.router.routerState.snapshot.url,
          timestamp: Date.now()
        })
        .subscribe((_) => {
          window.localStorage.setItem(this.APP_LOGOUT_EVENT_KEY, `${Date.now()}`);
        });
    }
    this.userService.logout();
  }

  // get the route the current user was on when logging out
  getRouteOnLogout(): Observable<{ uri: string; timestamp: number }> {
    return this.appCache.getItem(this.getRouteOnLogoutStorageKey());
  }

  private getRouteOnLogoutStorageKey() {
    const currentUser: YuvUser = this.userService.getCurrentUser();
    return `yuv.client.logout.route.${currentUser ? currentUser.id : 'undefined'}`;
  }
}
