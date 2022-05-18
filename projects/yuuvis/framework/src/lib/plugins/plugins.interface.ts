import { NavigationExtras, Router } from '@angular/router';
import { DmsObject, HttpOptions, YuvEvent, YuvUser } from '@yuuvis/core';
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
    user: {
      get: () => YuvUser;
      hasRole: (role: string) => boolean;
      hasAdminRole: () => boolean;
      hasSystemRole: () => boolean;
      hasAdministrationRoles: () => boolean;
      hasManageSettingsRole: () => boolean;
      hasAdvancedUserRole: () => boolean;
    };
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
     * @param options additional HttpOptions
     */
    get(uri: string, base?: string, options?: HttpOptions): any;
    /**
     * Execute a POST request against yuuvis backend
     * @param uri URI the request should be sent to
     * @param data Data to be send along with the request
     * @param base URI part of the service this request belongs to
     * @param options additional HttpOptions
     */
    post(uri: string, data: any, base?: string, options?: HttpOptions): any;
    /**
     * Execute a DELETE request against yuuvis backend
     * @param uri URI the request should be sent to
     * @param base URI part of the service this request belongs to
     * @param options additional HttpOptions
     */
    del(uri: string, base?: string, options?: HttpOptions): any;
    /**
     * Execute a PUT request against yuuvis backend
     * @param uri URI the request should be sent to
     * @param data Data to be send along with the request
     * @param base URI part of the service this request belongs to
     * @param options additional HttpOptions
     */
    put(uri: string, data: any, base?: string, options?: HttpOptions): any;
  };
  /**
   * Utilities
   */
  form: {
    activeForms(): any[];
    getValue(formControlName: string): any;
    setValue(formControlName: string, newValue: any): void;
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
    triggerError: (err, win, parameters) => any;
    catchError: () => any;
    resolveViewerParams: (parameters, dmsObject) => any;
    validateUrl: (uri) => any;
  };
  /**
   * Application storage
   */
  storage: {
    getItem: (key) => any;
    setItem: (key, value) => any;
  };
  /**
   * Utilities
   */
  util: {
    $: (selectors, element) => any;
    $$: (selectors, element) => any;
    styles: (styles, id) => any;
    translate: (key: string, data?: any) => string;
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

/**
 * PluginConfig
 */
export interface PluginConfig {
  id: string;
  label: string;
  disabled?: boolean | string | Function;
  plugin?: PluginComponentConfig;
}

/**
 * PluginComponentConfig
 */
export interface PluginComponentConfig {
  src?: string; // src for iframe
  styles?: string[];
  styleUrls?: string[];
  html?: string;
  component?: string; // ID (selector) of Angular Component
  inputs?: any;
  outputs?: any;
  popoverConfig?: any;
}

/**
 * PluginLinkConfig
 */
export interface PluginLinkConfig extends PluginConfig {
  path: string;
  matchHook: string;
}

/**
 * PluginStateConfig
 */
export interface PluginStateConfig extends PluginLinkConfig {
  canActivate?: string | Function;
  canDeactivate?: string | Function;
  plugin: PluginComponentConfig;
}

/**
 * PluginActionConfig
 */
export interface PluginActionConfig extends PluginConfig {
  description?: string;
  priority?: string;
  icon?: string;
  group: string;
  range?: string;
  isExecutable?: string | Function;
  run?: string | Function;
  // action LINK
  getLink?: string | Function;
  getParams?: string | Function;
  getFragment?: string | Function;
  // action LIST
  header?: string;
  subActionComponents?: string;
  // action COMPONENT
  buttons?: { cancel?: string; finish?: string };
  fullscreen?: boolean | string;
}

/**
 * PluginTriggerConfig
 */
export interface PluginTriggerConfig extends PluginActionConfig {
  matchHook: string;
}

/**
 * PluginExtensionConfig
 */
export interface PluginExtensionConfig extends PluginConfig {
  matchHook: string;
  plugin: PluginComponentConfig;
}

/**
 * PluginViewerConfig
 */

export type PluginViewerConfigType = 'compare' | 'extend' | 'error' | 'default';

export interface PluginViewerConfig {
  mimeType?: string | string[];
  fileExtension?: string | string[];
  viewer: string;
  error?: boolean;
  type?: PluginViewerConfigType;
}

/**
 * PluginConfigList
 */
export interface PluginConfigList {
  disabled?: boolean | string | Function;
  load?: string | Function;
  links?: PluginLinkConfig[];
  states?: PluginStateConfig[];
  actions?: (PluginActionConfig | string)[];
  extensions?: PluginExtensionConfig[];
  triggers?: PluginTriggerConfig[];
  viewers?: PluginViewerConfig[];
  translations?: { en?: any; de?: any };
}
