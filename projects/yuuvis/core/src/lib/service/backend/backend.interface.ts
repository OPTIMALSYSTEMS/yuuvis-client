import { HttpHeaders, HttpParams } from '@angular/common/http';
export interface OpenIdConfig {
  host: string;
  tenant: string;
  issuer: string;
  clientId: string;
  // URL of the SPA to redirect the user to after login
  redirectUri?: string;
  postLogoutRedirectUri?: string;
}
/**
 * HttpOptions for http request
 * @param observe: 'body' | 'events' | 'response'
 * @param responseType: 'arraybuffer' | 'blob' | 'json' | 'text'
 */
export interface HttpOptions {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: any;
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
  reportProgress?: boolean;
  responseType?: any;
  withCredentials?: boolean;
}

export interface HttpDeleteOptions extends HttpOptions {
  body?: any;
}
