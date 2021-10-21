import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, shareReplay, tap } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { CoreConfig } from '../config/core-config';
import { CORE_CONFIG } from '../config/core-config.tokens';
import { Logger } from '../logger/logger';
import { TENANT_HEADER } from '../system/system.enum';
import { ApiBase } from './api.enum';
import { HttpOptions } from './backend.interface';

/**
 * Service for providing an yuuvis Backend
 */
@Injectable({ providedIn: 'root' })
export class BackendService {
  private cache = new Map<string, any>();
  private temp = new Map<string, Observable<any>>();
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * @ignore
   */
  constructor(private http: HttpClient, private logger: Logger, @Inject(CORE_CONFIG) public coreConfig: CoreConfig, private config: ConfigService) {}

  authUsesOpenIdConnect(): boolean {
    return !!this.coreConfig.oidc;
  }

  /**
   * OpenIdConnect authorization headers
   */
  getAuthHeaders(): any {
    return this.authUsesOpenIdConnect()
      ? {
          [TENANT_HEADER]: this.coreConfig.oidc.tenant,
          authorization: 'Bearer ' + localStorage.access_token
        }
      : {};
  }

  /**
   * Add a new header.
   * @param key The headers name
   * @param value The value to be added to the headers. Setting this to null
   * will remove the header
   */
  setHeader(key: string, value: string) {
    if (value && value.length) {
      this.headers = this.headers.set(key, value);
    } else {
      this.headers = this.headers.delete(key);
    }
  }

  /**
   * Wrapped HTTP GET method
   * @param uri The REST URI to be queried
   * @param base The Base URI (backend service) to be used
   * @param requestOptions Additional request options
   * @returns The data retrieved from the given endpoint
   */
  get(uri: string, base?: string, requestOptions?: HttpOptions): Observable<any> {
    return this.http.get(this.getApiBase(base) + uri, this.getHttpOptions(requestOptions));
  }

  /**
   * Wrapped HTTP POST method
   * @param uri The target REST URI
   * @param data Data to be 'posted'
   * @param base The Base URI (backend service) to be used
   * @param requestOptions Additional request options
   * @returns The return value of the target POST endpoint
   */
  public post(uri: string, data?, base?: string, requestOptions?: HttpOptions): Observable<any> {
    const baseUri = this.getApiBase(base);
    const payload = data ? JSON.stringify(data) : '';
    return this.http.post(`${baseUri}${uri}`, payload, this.getHttpOptions(requestOptions));
  }

  /**
   * Performs a multipart form data POST request.
   * @param uri The target REST URI
   * @param formData FormData to be 'posted'
   * @param base The Base URI (backend service) to be used
   * @param requestOptions Additional request options
   * @returns The return value of the target POST endpoint
   */
  public postMultiPart(uri: string, formData: FormData, base?: string, requestOptions?: HttpOptions): Observable<any> {
    return this.http.post(`${this.getApiBase(base)}${uri}`, formData, this.getHttpOptions(requestOptions));
  }

  /**
   * Wrapped HTTP PATCH method
   * @param uri The target REST URI
   * @param data Data to be 'patched'
   * @param base The Base URI (backend service) to be used
   * @param requestOptions Additional request options
   * @returns The return value of the target PATCH endpoint
   */
  public patch(uri: string, data?, base?: string, requestOptions?: HttpOptions): Observable<any> {
    const baseUri = this.getApiBase(base);
    const payload = data ? JSON.stringify(data) : '';
    return this.http.patch(`${baseUri}${uri}`, payload, this.getHttpOptions(requestOptions));
  }

  /**
   * Wrapped HTTP PUT method
   * @param uri The target REST URI
   * @param data Data to be 'posted'
   * @param base The Base URI (backend service) to be used
   * @param requestOptions Additional request options
   * @returns The return value of the target PUT endpoint
   */
  public put(uri: string, data?: any, base?: string, requestOptions?: HttpOptions): Observable<any> {
    return this.http.put(this.getApiBase(base) + uri, data, this.getHttpOptions(requestOptions));
  }

  /**
   * Wrapped HTTP DELETE method
   * @param uri The target REST URI
   * @param base The Base URI (backend service) to be used
   * @param requestOptions Additional request options
   * @returns The return value of the target DELETE endpoint
   */
  public delete(uri: string, base?: string, requestOptions?: HttpOptions): Observable<any> {
    return this.http.delete(this.getApiBase(base) + uri, this.getHttpOptions(requestOptions));
  }

  /**
   * @ignore
   * Cache for small requests like icons and configs
   *
   * @param string uri
   * @returns Observable<any>
   */
  public getViaCache(uri: string): Observable<any> {
    if (this.cache.has(uri)) {
      return of(this.cache.get(uri));
    } else {
      const requestOptions: any = {
        responseType: 'text',
        headers: {}
      };
      if (this.authUsesOpenIdConnect()) {
        requestOptions.headers[TENANT_HEADER] = this.coreConfig.oidc.tenant;
      }
      return this.getViaTempCache(uri, () => this.http.get(uri, requestOptions).pipe(tap((text) => this.cache.set(uri, text))));
    }
  }

  /**
   * @ignore
   * Temporary Cache for multiple identical requests
   *
   * @param string id
   * @param Function request
   * @returns Observable<any>
   */
  public getViaTempCache(id: string, request?: Function): Observable<any> {
    if (this.temp.has(id)) {
      return this.temp.get(id);
    } else {
      const resp = (request ? request() : this.get(id)).pipe(
        finalize(() => this.temp.delete(id)),
        shareReplay(1)
      );
      this.temp.set(id, resp);
      return resp;
    }
  }

  public download(uri: string, filename?: string) {
    if (document && document.body) {
      const a = document.createElement('a');
      a.setAttribute('href', uri);
      a.style.display = 'none';
      a.setAttribute('download', filename || 'download');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      this.logger.error('Environment not supported. Downloading contents relies on a DOM being available.');
    }
  }

  /**
   * Gets the base URI for an API endpoint
   * @param api The API to get the base URI for. Leaving this blank will return
   * base URI for the web API
   * @param origin The flag to include location origin
   * @returns Base URI for the given API.
   */
  getApiBase(api?: string, origin = false): string {
    const apiBase = api === ApiBase.none ? api : this.config.getApiBase(api || ApiBase.apiWeb);
    return `${this.authUsesOpenIdConnect() ? this.coreConfig.oidc.host : origin ? location.origin : ''}${apiBase || ''}`;
  }

  /**
   * @ignore
   */
  getHttpOptions(requestOptions?: HttpOptions): HttpOptions {
    return Object.assign({ headers: this.headers }, requestOptions);
  }

  /**
   * Batch service
   */
  batch(requests: { method?: string; uri: string; body?: any; base?: string; requestOptions?: HttpOptions }[]) {
    const httpRequests = requests.map((r) =>
      this[(r.method || 'get').toLowerCase()]
        .apply(
          this,
          [r.uri, r.body, r.base, r.requestOptions].filter((a) => a)
        )
        .pipe(catchError((err) => of({ _error: err })))
    );
    return forkJoin(httpRequests) as Observable<any[]>;
  }
}
