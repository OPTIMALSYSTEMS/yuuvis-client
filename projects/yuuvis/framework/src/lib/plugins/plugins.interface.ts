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
export interface PluginViewerConfig {
  mimeType: string | string[];
  fileExtension?: string | string[];
  viewer: string;
}

/**
 * List of all plugins
 *
 * Here is an example of all types of plugins:
 {
  "disabled": false,
  "links": [
    {
	  "disabled": "(api, currentState) => !api.session.user.hasAdminRole()",
      "id": "yuv.custom.link.home_yuuvis",
      "label": "yuv.custom.action.home_yuuvis.label",
      "path": "https://help.optimal-systems.com/yuuvis/home_yuuvis_en.html",
      "matchHook": "yuv-sidebar-navigation|yuv-sidebar-settings"
    }
  ],
  "states": [
    {
      "id": "yuv.custom.state.home_yuuvis",
      "label": "yuv.custom.action.home_yuuvis.label",
      "path": "custom/home",
      "matchHook": "yuv-sidebar-navigation",
      "canActivate": "(currentRoute, currentState) => true",
      "canDeactivate": "(component, currentRoute, currentState, nextState) => !!nextState.url.match('/dashboard')",
      "plugin": {
        "component": "yuv-object-details",
        "inputs": { "objectId": "'6e97a9ee-90e8-47f5-9e1d-883c1db2d387'" }
      }
    }
  ],
  "actions": [
    {
      "id": "yuv.custom.action.home_yuuvis.simple",
      "label": "yuv.custom.action.home_yuuvis.simple",
      "description": "yuv.custom.action.home_yuuvis.description",
      "priority": 0,
      "icon": "",
      "group": "common",
      "range": "MULTI_SELECT",
      "isExecutable": "(item) => item.id",
      "run": "(selection) => this.router.navigate(['dashboard'])"
    },
    {
      "id": "yuv.custom.action.home_yuuvis.component",
      "label": "yuv.custom.action.home_yuuvis.component",
      "description": "yuv.custom.action.home_yuuvis.description",
      "icon": "",
      "isExecutable": "(item) => item.id",
      "buttons": {},
      "plugin": {
        "component": "yuv-object-form-edit",
        "inputs": { "dmsObject": "parent.selection[0]" }
      }
    },
    {
      "id": "yuv.custom.action.home_yuuvis.component.full",
      "label": "yuv.custom.action.home_yuuvis.component.full",
      "description": "yuv.custom.action.home_yuuvis.description",
      "icon": "",
      "isExecutable": "(item) => item.id",
      "fullscreen": true,
      "buttons": { "finish": "yuv.custom.action.home_yuuvis.label" },
      "plugin": {
        "src": "https://help.optimal-systems.com/yuuvis/home_yuuvis_en.html"
      }
    },
    {
      "id": "yuv.custom.action.home_yuuvis.link",
      "label": "yuv.custom.action.home_yuuvis.link",
      "description": "yuv.custom.action.home_yuuvis.description",
      "icon": "",
      "isExecutable": "(item) => item.id",
      "getLink": "(selection) => '/dashboard'",
      "getParams": "(selection) => null",
      "getFragment": "(selection) => null"
    },
    {
      "id": "yuv.custom.action.home_yuuvis.list",
      "label": "yuv.custom.action.home_yuuvis.list",
      "description": "yuv.custom.action.home_yuuvis.description",
      "icon": "",
      "isExecutable": "(item) => item.id",
      "header": "yuv.custom.action.home_yuuvis.label",
      "subActionComponents": [
        {
          "id": "yuv.custom.action.home_yuuvis.sub.simple",
          "label": "yuv.custom.action.home_yuuvis.simple",
          "description": "yuv.custom.action.home_yuuvis.description",
          "priority": 0,
          "icon": "",
          "group": "common",
          "range": "MULTI_SELECT",
          "isExecutable": "(item) => item.id",
          "run": "(selection) => this.router.navigate(['dashboard'])"
        }
      ]
    },
	"yuv-download-action", "yuv-delete-action", "yuv-delete", "yuv-upload", "yuv-upload-action", "yuv-move-action", "yuv-move", "yuv-follow-up-action", "yuv-follow-up", "yuv-reference-action", "yuv-open-context-action", "yuv-open-versions-action", "yuv-clipboard-action", "yuv-clipboard-link-action"
  ],
  "extensions": [
    {
      "id": "yuv.custom.plugin.home_yuuvis",
      "label": "yuv.custom.action.home_yuuvis.label",
      "matchHook": "yuv-*",
      "plugin": "https://help.optimal-systems.com/yuuvis/home_yuuvis_en.html"
    },
    {
      "id": "yuv.custom.plugin.home_yuuvis.complex",
      "label": "yuv.custom.action.home_yuuvis.description",
      "matchHook": "yuv-*",
      "plugin": {
        "html": "<a href='https://help.optimal-systems.com/yuuvis/home_yuuvis_en.html'> Yuuvis Home </a> <button onclick=\"api.router.navigate(['dashboard'])\">Go to Dashboard</button>",
        "styles": ["a {color: red;}"],
        "styleUrls": []
      }
    }
  ],
  "triggers": [
    {
      "id": "yuv.custom.trigger.paste.clipboard",
      "label": "yuv.custom.trigger.paste.clipboard",
      "matchHook": "yuv-*",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path opacity=\".3\" d=\"M17 7H7V4H5v16h14V4h-2z\" fill=\"white\"/><path d=\"M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm7 18H5V4h2v3h10V4h2v16z\" fill=\"#626262\"/></svg>",
      "isExecutable": "(component) => component.parent.formControlName",
      "run": "(component) => {var _this = this; navigator.clipboard.readText().then((v) => v && _this.form.modelChange(component.parent.formControlName, {name: 'value', newValue: v}))}"
    },
    {
      "id": "yuv.custom.trigger.paste.selection",
      "label": "yuv.custom.trigger.paste.selection",
      "matchHook": "yuv-*",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path opacity=\".3\" d=\"M17 7H7V4H5v16h14V4h-2z\" fill=\"blue\"/><path d=\"M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm7 18H5V4h2v3h10V4h2v16z\" fill=\"#626262\"/></svg>",
      "fullscreen": true,
      "buttons": { "finish": "yuv.custom.action.home_yuuvis.label" },
      "plugin": {
        "src": "https://help.optimal-systems.com/yuuvis/home_yuuvis_en.html"
      },
      "isExecutable": "(component) => component.parent.formControlName && this.content.viewer()",
      "run": "(component) => {var w = this.content.viewer(); var v = w && w.getSelection().toString(); v && this.form.modelChange(component.parent.formControlName, {name: 'value', newValue: v}) }"
    },
    {
      "id": "yuv.custom.trigger.paste.suggestion",
      "label": "yuv.custom.trigger.paste.suggestion",
      "matchHook": "yuv-*",
      "group": "visible",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path opacity=\".3\" d=\"M17 7H7V4H5v16h14V4h-2z\" fill=\"yellow\"/><path d=\"M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm7 18H5V4h2v3h10V4h2v16z\" fill=\"#626262\"/></svg>",
      "isExecutable": "(component) => component.parent.formControlName && this.content.viewer()",
      "run": " (component) => { var api = this, id = '_suggestion', sid = id + 'Styles', w = api.content.viewer(); if (!w) return; var attr = (name) => '[data-name=\"' + name + '\"]'; api.util.styles(attr(component.parent.formControlName) + ' {background-color: rgba(255,255,0,0.3);}', sid); api.util.styles('span:hover {background-color: rgba(255,255,0,1);}', sid, w); if (!w[id]) { w.document.addEventListener('click', (e) => { var v = w.getSelection().toString() || (!e.path[0].children.length && e.path[0].innerText); if (v) { api.form.modelChange(w[id], { name: 'value', newValue: v }); var triggers = Array.from(api.util.$$( '.triggers.visible yuv-plugin-trigger yuv-icon:not([hidden])' )); var nextTriggerIndex = 1 + triggers.findIndex((t) => api.util.$(attr(w[id]), t.parentElement.parentElement.parentElement)); triggers[nextTriggerIndex] && triggers[nextTriggerIndex].click(); } }); w.addEventListener('beforeunload', () => api.util.styles('', sid)); } w[id] = component.parent.formControlName; }"
    },
    {
      "id": "yuv.custom.trigger.home_yuuvis",
      "label": "yuv.custom.action.home_yuuvis.label",
      "matchHook": "yuv-*",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path opacity=\".3\" d=\"M17 7H7V4H5v16h14V4h-2z\" fill=\"hotpink\"/><path d=\"M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm7 18H5V4h2v3h10V4h2v16z\" fill=\"#626262\"/></svg>",
      "fullscreen": true,
      "buttons": { "finish": "yuv.custom.action.home_yuuvis.label" },
      "plugin": {
        "src": "https://help.optimal-systems.com/yuuvis/home_yuuvis_en.html",
        "popoverConfig": {
          "height": "60%",
          "width": "60%"
        }
      },
      "isExecutable": "(component) => component.parent.formControlName",
      "run": "(component) => component.openPopover()"
    }
  ],
  "viewers":[
	  {
		"mimeType": "application/pdf",
		"fileExtension": ["pdf"],
		"viewer": "pdf/web/viewer.html?file=${path}#locale=${locale}&direction=${direction}&theme=${theme}&accentColor=${accentColor}"
	  }
	],
  "translations": {
    "en": {
      "yuv.custom.action.home_yuuvis.label": "Yuuvis Home",
      "yuv.custom.action.home_yuuvis.description": "Yuuvis Description",
      "yuv.custom.action.home_yuuvis.simple": "Yuuvis Home simple",
      "yuv.custom.action.home_yuuvis.component": "Yuuvis Home component",
      "yuv.custom.action.home_yuuvis.component.full": "Yuuvis Home component full",
      "yuv.custom.action.home_yuuvis.link": "Yuuvis Home link",
      "yuv.custom.action.home_yuuvis.list": "Yuuvis Home list",
      "yuv.custom.trigger.paste.clipboard": "Paste clipboard",
      "yuv.custom.trigger.paste.selection": "Paste selection",
      "yuv.custom.trigger.paste.suggestion": "Paste suggestion"
    },
    "de": {
      "yuv.custom.action.home_yuuvis.label": "Yuuvis Home DE",
      "yuv.custom.action.home_yuuvis.description": "Yuuvis Description DE",
      "yuv.custom.action.home_yuuvis.simple": "Yuuvis Home simple DE",
      "yuv.custom.action.home_yuuvis.component": "Yuuvis Home component DE",
      "yuv.custom.action.home_yuuvis.component.full": "Yuuvis Home component full DE",
      "yuv.custom.action.home_yuuvis.link": "Yuuvis Home link DE",
      "yuv.custom.action.home_yuuvis.list": "Yuuvis Home list DE",
      "yuv.custom.trigger.paste.clipboard": "Paste clipboard DE",
      "yuv.custom.trigger.paste.selection": "Paste selection DE",
      "yuv.custom.trigger.paste.suggestion": "Paste suggestion"
    }
  }
}

 *
 */
export interface PluginConfigList {
  disabled?: boolean | string | Function;
  links?: PluginLinkConfig[];
  states?: PluginStateConfig[];
  actions?: (PluginActionConfig | string)[];
  extensions?: PluginExtensionConfig[];
  triggers?: PluginTriggerConfig[];
  viewers?: PluginViewerConfig[];
  translations?: { en?: any; de?: any };
}
