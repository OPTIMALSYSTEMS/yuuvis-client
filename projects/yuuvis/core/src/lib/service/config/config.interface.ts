/**
 * Interface for the applications main config file
 * @ignore
 */
export interface YuvConfig {
  apiBase: string;
  languages: YuvConfigLanguages[];
  about: {
    docu: {
      link: string;
      label: string;
    };
  };
}

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
