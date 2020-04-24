import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from '@yuuvis/core';

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

  constructor(private router: Router) {}

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
    this.router.navigate(['/create', params]);
  }
}
