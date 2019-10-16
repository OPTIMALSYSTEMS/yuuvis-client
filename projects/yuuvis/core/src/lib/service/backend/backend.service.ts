import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DmsObject } from '../../model/dms-object.model';
import { ConfigService } from '../config/config.service';
import { Logger } from '../logger/logger';
import { ApiBase } from './api.enum';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private headers = this.setDefaultHeaders();
  private persistedHeaders: any = {};

  constructor(private http: HttpClient, private logger: Logger, private config: ConfigService) {}

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
  get(uri: string, base?: string, requestOptions?: any): Observable<any> {
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
  public post(uri: string, data?, base?: string, requestOptions?: any): Observable<any> {
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
  public postMultiPart(uri: string, formData: FormData, base?: string, requestOptions?: any): Observable<any> {
    return this.http.post(`${this.getApiBase(base)}${uri}`, formData, this.getHttpOptions(requestOptions));
  }

  /**
   * Wrapped HTTP PUT method
   * @param uri The target REST URI
   * @param data Data to be 'posted'
   * @param base The Base URI (backend service) to be used
   * @returns The return value of the target PUT endpoint
   */
  public put(uri: string, data?: any, base?: string): Observable<any> {
    return this.http.put(this.getApiBase(base) + uri, data, this.getHttpOptions());
  }

  /**
   * Wrapped HTTP DELETE method
   * @param uri The target REST URI
   * @param base The Base URI (backend service) to be used
   * @param requestOptions Additional request options
   * @returns The return value of the target DELETE endpoint
   */
  public delete(uri: string, base?: string, requestOptions?: any): Observable<any> {
    return this.http.delete(this.getApiBase(base) + uri, this.getHttpOptions(requestOptions));
  }

  /**
   * Downloads the content of dms objects.
   *
   * @param DmsObject[] dmsObjects Array of dms objects to be downloaded
   */
  public downloadContent(objects: DmsObject[], withVersion?: boolean) {
    objects.forEach(object => {
      let uri = `${this.getApiBase(ApiBase.apiWeb)}/dms/${object.id}/content`;
      if (withVersion && object.version) {
        uri += '?version=' + object.version;
      }
      this.download(uri);
    });
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
   * @returns Base URI for the given API.
   */
  private getApiBase(api?: string): string {
    // return this.getHost() + this.config.getApiBase(api || ApiBase.apiWeb);
    return this.config.getApiBase(api || ApiBase.apiWeb);
  }

  /**
   * @ignore
   */
  getHttpOptions(
    requestOptions?: any
  ): {
    headers?:
      | HttpHeaders
      | {
          [header: string]: string | string[];
        };
    observe?: 'body';
    params?:
      | HttpParams
      | {
          [param: string]: string | string[];
        };
    reportProgress?: boolean;
    responseType: 'arraybuffer';
    withCredentials?: boolean;
  } {
    return Object.assign({ headers: this.getHeaders() }, requestOptions);
  }

  /**
   * Retrieves the current headers
   * @returns The `HttpHeaders` that are currently set up
   */
  private getHeaders(): HttpHeaders {
    return this.headers;
  }

  private setDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-os-include-links': 'false',
      'X-os-include-actions': 'false',
      'X-os-sync-index': 'true',
      'Access-Control-Allow-Origin': '*'
    });
  }
}
