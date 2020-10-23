import { InjectionToken } from '@angular/core';

export interface YuvRoutes {
  /**
   * Object state
   */
  object?: {
    path: string;
    params: {
      id: string;
    };
    queryParams?: {
      query: string;
    };
  };

  /**
   * Version stuff
   */
  versions?: {
    path: string;
    params: {
      id: string;
    };
    queryParams?: {
      version: string;
    };
  };

  /**
   * Result state
   */
  result?: {
    path: string;
    queryParams: {
      query: string;
    };
  };
}

export const ROUTES = new InjectionToken<YuvRoutes>('ROUTES');
