import { OpenIdConfig } from '../backend/backend.interface';
/**
 * Interface for the applications main config file
 * @ignore
 */
export interface YuvConfig {
  core: {
    apiBase: {
      core: string;
      'api-web': string;
    };
    languages: YuvConfigLanguages[];
    logging?: {
      level: 'debug' | 'error' | 'warn' | 'info';
    };
    permissions?: {
      retentionManagerRole?: string;
      advancedUserRole?: string;
      manageSettingsRole?: string;
    };
    clientdefaults?: {
      titleProperty?: string;
      descriptionProperty?: string;
    };
    app?: {
      // tasks are loaded in chunks. InboxPageSize defines the size of those chunks
      inboxPageSize?: number;
      processesPageSize?: number;
    };
  };
  oidc?: OpenIdConfig;
}
/**
 * interface providing localization of application
 */
export interface YuvConfigLanguages {
  iso: string;
  label: string;
  dir?: Direction;
  fallback?: boolean;
}

export enum Direction {
  LTR = 'ltr',
  RTL = 'rtl'
}
