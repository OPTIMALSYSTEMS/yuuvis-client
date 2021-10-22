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
