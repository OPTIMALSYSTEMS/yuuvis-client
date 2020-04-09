import { Router } from '@angular/router';
import { DmsObject, YuvEvent, YuvUser } from '@yuuvis/core';
import { Observable } from 'rxjs';

export interface PluginAPI {
  router: {
    get(): Router;
  };
  events: {
    /**
     * Listen to a certain type of yuuvis event ({@link YuvEventType})
     * @param type Key of the event to listen to
     */
    on(type: string): Observable<YuvEvent>;
    /**
     * Trigger a certain type of yuuvis event ({@link YuvEventType})
     * @param type Key of the event to be triggered
     * @param data Some data to attach to the event
     */
    trigger(type: string, data?: any): void;
  };
  session: {
    /**
     * Get the user that is currently logged in
     */
    getUser(): YuvUser;
  };
  dms: {
    /**
     * Fetches a dms object
     * @param id ID of the dms object
     * @param version Version of the object
     */
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
  util: {
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
