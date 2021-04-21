import { NavigationExtras, Router } from '@angular/router';
import { DmsObject, YuvEvent, YuvUser } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { ObjectFormModelChange } from '../object-form/object-form/object-form.component';

/**
 * Providing a plugin service and injected into form scripts
 */
export interface PluginAPI {
  /**
   * Get instance of plugin component or parent of plugin component based on plugin ID
   *
   */
  components: {
    get: (id: string) => any;
    getParent: (id: string) => any;
  };
  /**
   * Listen to a certain type of yuuvis event ({@link YuvEventType})
   *
   */
  router: {
    get(): Router;
    navigate(commands: any[], extras: NavigationExtras): any;
  };

  /**
   * Listen to a certain type of yuuvis event ({@link YuvEventType})
   *
   */
  events: {
    yuuvisEventType: any;
    on(type: string): Observable<YuvEvent>;
    /**
     * Trigger a certain type of yuuvis event ({@link YuvEventType})
     * @param type Key of the event to be triggered
     * @param data Some data to attach to the event
     */
    trigger(type: string, data?: any): void;
  };
  /**
   * Get the user that is currently logged in
   */
  session: {
    getUser(): YuvUser;
  };
  /**
   * Fetches a dms object
   *
   *
   */
  dms: {
    getObject(id: string, version?: number): Promise<DmsObject>;
    /**
     * Fetches dms objects from the backend that match the given params
     * @param fields The fields to match. example: {name: 'max', plz: '47111}
     * @param type target object type
     */
    getResult(fields, type): Promise<DmsObject[]>;
    /**
     * Start download of the document files of the given dms objects
     * @param dmsObjects Array of dms objects to download document files for
     */
    downloadContent(dmsObjects: DmsObject[]): void;
  };
  /**
   * Execute a requests against yuuvis backend
   */
  http: {
    /**
     * Execute a GET request against yuuvis backend
     * @param uri URI the request should be sent to
     * @param base URI part of the service this request belongs to
     */
    get(uri: string, base?: string): any;
    /**
     * Execute a POST request against yuuvis backend
     * @param uri URI the request should be sent to
     * @param data Data to be send along with the request
     * @param base URI part of the service this request belongs to
     */
    post(uri: string, data: any, base?: string): any;
    /**
     * Execute a DELETE request against yuuvis backend
     * @param uri URI the request should be sent to
     * @param base URI part of the service this request belongs to
     */
    del(uri: string, base?: string): any;
    /**
     * Execute a PUT request against yuuvis backend
     * @param uri URI the request should be sent to
     * @param data Data to be send along with the request
     * @param base URI part of the service this request belongs to
     */
    put(uri: string, data: any, base?: string): any;
  };
  /**
   * Utilities
   */
  form: {
    /**
     * Execute a change of form model
     * @param formControlName form control unique name | identifier
     * @param change object that contains name of parameter that should be changed ('value', 'required', ...) and newValue
     */
    modelChange(formControlName: string, change: ObjectFormModelChange): void;
  };
  /**
   * Content viewer window
   */
  content: {
    viewer: () => Window;
  };
  /**
   * Utilities
   */
  util: {
    $: (selectors, element) => any;
    $$: (selectors, element) => any;
    styles: (styles, id) => any;
    /**
     * Encode a filename safe for sending chars beyond ASCII-7bit using quoted printable encoding.
     * @param filename Filename to be encoded
     */
    encodeFileName(filename): string;
    notifier: {
      /**
       * Trigger a SUCCESS notification
       * @param text Message to be 'toasted'
       * @param title Title
       */
      success(text, title): void;
      /**
       * Trigger a ERROR notification
       * @param text Message to be 'toasted'
       * @param title Title
       */
      error(text, title): void;
      /**
       * Trigger a INFO notification
       * @param text Message to be 'toasted'
       * @param title Title
       */
      info(text, title): void;
      /**
       * Trigger a WARNING notification
       * @param text Message to be 'toasted'
       * @param title Title
       */
      warning(text, title): void;
    };
  };
}
