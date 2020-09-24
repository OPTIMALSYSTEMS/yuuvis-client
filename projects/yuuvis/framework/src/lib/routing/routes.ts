import { InjectionToken } from '@angular/core';

export interface YuvRoutes {
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
}

export const ROUTES = new InjectionToken<YuvRoutes>('ROUTES');
