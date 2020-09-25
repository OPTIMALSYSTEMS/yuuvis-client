import { NavigationExtras, Router } from '@angular/router';
import { EMPTY as observableEmpty, throwError as observableThrowError } from 'rxjs';
import { YuvError } from '../model/yuv-error.model';
import { FormattedMailTo, Sort } from './utils.helper.enum';

export class Utils {
  /**
   * Utility method for adding parameters to a given URI.
   *
   * @param uri The uri string to attach the parameters to
   * @param params The object containing parameters to be appended
   * @returns the given uri extended by the given parameters + remove empty parameters
   */
  public static buildUri(uri: string, params: {}): string {
    const q = Object.keys(params)
      .filter((k) => !Utils.isEmptyOrFalse(params[k]))
      .map((k) => k + '=' + encodeURIComponent(typeof params[k] === 'object' ? JSON.stringify(params[k]) : params[k]))
      .join('&');
    return uri + (q ? '?' + q : '');
  }

  public static formatMailTo(value: FormattedMailTo, isEmail: boolean): FormattedMailTo {
    if (isEmail && !!value) {
      if (Array.isArray(value)) {
        return value.join().replace(/,/g, '; ');
      } else {
        return value.replace(/,/g, '; ');
      }
    }
    return value;
  }

  /**
   * Creates a unique identifier.
   * @returns A Universally Unique Identifier
   */
  public static uuid(): string {
    return Utils._p8() + Utils._p8(true) + Utils._p8(true) + Utils._p8();
  }

  /**
   * Encode a filename safe for sending chars beyond ASCII-7bit using quoted printable encoding.
   *
   * @param filename The file name
   * @returns The quoted printable filename
   */
  public static encodeFileName(filename: string): string {
    const fileName = Utils.encodeToQuotedPrintable(Utils.encodeToUtf8(filename)).replace(/_/g, '=5F');
    return `=?UTF-8?Q?${fileName}?=`;
  }

  /**
   *
   * @param boolean s
   * @return string
   */
  private static _p8(s?: boolean): string {
    const p = (Math.random().toString(16) + '000000000').substr(2, 8);
    return s ? `-${p.substr(0, 4)}-${p.substr(4, 4)}` : p;
  }

  /**
   * Converts a javascript text to the utf-8 converted variant.
   * See [unicode]{@link http://thlist.onlinehome.de/thomas_homepage/unicode/UTF-8%20Konvertierung%20mittels%20JavaScript.htm} for reference
   *
   * @param rawinput The input string
   * @returns The utf-8 converted string
   */
  private static encodeToUtf8(rawinput) {
    /**
     * Normalize line breaks
     */
    rawinput = rawinput.replace(/\r\n/g, '\n');
    let utfreturn = '';
    for (let n = 0; n < rawinput.length; n++) {
      /**
       * Unicode for current char
       */
      const c = rawinput.charCodeAt(n);
      if (c < 128) {
        /**
         * All chars range 0-127 => 1byte
         */
        utfreturn += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        /**
         * All chars range from 127 to 2047 => 2byte
         */
        utfreturn += String.fromCharCode((c >> 6) | 192);
        utfreturn += String.fromCharCode((c & 63) | 128);
      } else {
        /**
         * All chars range from 2048 to 66536 => 3byte
         */
        utfreturn += String.fromCharCode((c >> 12) | 224);
        utfreturn += String.fromCharCode(((c >> 6) & 63) | 128);
        utfreturn += String.fromCharCode((c & 63) | 128);
      }
    }
    return utfreturn;
  }

  /**
   * See [quoted-printable]{@link https://github.com/mathiasbynens/quoted-printable/blob/master/quoted-printable.js}
   **/
  private static quotedPrintable(symbol) {
    if (symbol > '\xFF') {
      throw RangeError('`encodeToQuotedPrintable` expects extended ASCII input only. Missing prior UTF-8 encoding?');
    }
    const codePoint = symbol.charCodeAt(0);
    const hexadecimal = codePoint.toString(16).toUpperCase();
    return '=' + ('0' + hexadecimal).slice(-2);
  }

  /**
   * Encode symbols that are definitely unsafe (i.e. unsafe in any context). The regular expression describes these unsafe symbols.
   *
   * @param rawinput Input string to be encoded
   * @returns The encoded string
   */
  private static encodeToQuotedPrintable(rawinput): string {
    const encoded = rawinput.replace(/[\0-\b\n-\x1F=\x7F-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF]/g, this.quotedPrintable);
    return encoded;
  }

  /**
   * Sorts An Array of Object by given key
   * See [ng-packagr issues 696]{@link https://github.com/dherges/ng-packagr/issues/696}
   *
   * @param key
   * @param order
   * @param locales
   * @param options
   * @returns (a: any, b: any) => number
   */
  public static sortValues(key = '', order = Sort.ASC, locales?: string | string[], options?: Intl.CollatorOptions) {
    const f = (a: any, b: any) => {
      let comparison: number;
      const varA = Utils.getProperty(a, key);
      const varB = Utils.getProperty(b, key);

      if (typeof varA === 'number' && typeof varB === 'number') {
        comparison = varA - varB;
      } else if (varA instanceof Date && varB instanceof Date) {
        comparison = new Date(varA).getTime() - new Date(varB).getTime();
      } else {
        const stringA = varA || varA === 0 ? varA.toString() : '';
        const stringB = varB || varB === 0 ? varB.toString() : '';
        comparison = stringA.localeCompare(stringB, locales, options);
      }
      return order === Sort.DESC ? comparison * -1 : comparison;
    };
    return f;
  }

  /**
   * [ng-packagr issues 696]{@link https://github.com/dherges/ng-packagr/issues/696}
   *
   * @param object
   * @param string key
   * @returns any
   */
  public static getProperty(object: any, key = ''): any {
    const f = key ? key.split('.').reduce((o, k) => (o || {})[k], object) : object;
    return f;
  }

  /**
   * Use on Observable.catch or Observable.subscribe to return empty value
   * [ng-packagr issues 696]{@link https://github.com/dherges/ng-packagr/issues/696}
   *
   * @param (error) => any callback
   * @returns (error) => Observable<never>
   */
  public static empty(callback?: (error) => any) {
    const f = (error) => {
      return observableEmpty;
    };
    return f;
  }

  /**
   * Use on Observable.catch with specific skipNotification function !!!
   * [ng-packagr issues 696]{@link https://github.com/dherges/ng-packagr/issues/696}
   *
   * @param skipNotification
   * @param callback
   * @param name
   * @param message
   */
  public static catchSkip(skipNotification?: (error) => any, callback?: (error) => any, name?: string, message?: string) {
    const f = (error) => {
      const _error = callback && callback(error);
      const _skipNotification = skipNotification && skipNotification(error);
      return observableThrowError(new YuvError(_error instanceof Error ? _error : error, name, message, _skipNotification));
    };
    return f;
  }

  /**
   * Use on Observable.catch !!!
   * [ng-packagr issues]{@link https://github.com/dherges/ng-packagr/issues/696}
   *
   * @param callback
   * @param name
   * @param message
   * @param skipNotification
   * @return (error) => Observable<never>
   */
  public static catch(callback?: (error) => any, name?: string, message?: string, skipNotification?: boolean) {
    const f = (error) => {
      const _error = callback && callback(error);
      return observableThrowError(new YuvError(_error instanceof Error ? _error : error, name, message, skipNotification));
    };
    return f;
  }

  /**
   * Use on Observable.subscribe !!!
   * [ng-packagr issues]{@link https://github.com/dherges/ng-packagr/issues/696}
   *
   * @param callback
   * @param name
   * @param message
   * @param skipNotification
   * @return (error) => void
   */
  public static throw(callback?: (error) => any, name?: string, message?: string, skipNotification?: boolean) {
    const f = (error) => {
      const _error = callback && callback(error);
      throw new YuvError(_error instanceof Error ? _error : error, name, message, skipNotification);
    };
    return f;
  }

  /**
   * Use on Observable.subscribe only if you want to skip notification / toast!!!
   *
   * @param callback
   * @param name
   * @param message
   * @param skipNotification
   * @return (error) => void
   */
  public static logError(callback?: (error) => any, name?: string, message?: string, skipNotification = true) {
    return Utils.throw(callback, name, message, skipNotification);
  }

  /**
   * Checks if element is visible
   *
   * @param elem
   * @return boolean
   */
  public static isVisible(elem: any): boolean {
    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
  }

  public static getBaseHref(removeTrailingSlash?: boolean) {
    const baseHref = document.getElementsByTagName('base')[0].getAttribute('href');
    return removeTrailingSlash ? baseHref.substr(0, baseHref.length - 1) : baseHref;
  }

  /**
   * Truncate a string (first argument) if it is longer than the given maximum string length (second argument).
   * Return the truncated string with a ... ending or whats provided.
   *
   * @param string str
   * @param number num
   */
  public static truncateString(str, num, ending = '...') {
    if (str.length > num) {
      if (num > 3) {
        num -= 3;
      }
      str = `${str.substring(0, num)}${ending}`;
    }
    return str;
  }

  /**
   * Get the TimeZone Offsest as ISO String.
   */
  public static getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
  }

  public static isEdge(): boolean {
    return !!navigator.userAgent && navigator.userAgent.indexOf('Edge') > -1;
  }

  public static isEmpty(obj) {
    if (obj == null || obj === '') {
      return true;
    }

    if (typeof obj === 'number') {
      return isNaN(obj);
    }

    return typeof obj === 'boolean' ? false : !Object.keys(obj).length;
  }

  public static isEmptyOrFalse(val) {
    return typeof val === 'boolean' ? !val : Utils.isEmpty(val);
  }

  public static escapeHtml(str) {
    str = str ? str : '';
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    return String(str).replace(/[&<>"'\/]/g, (s) => entityMap[s]);
  }

  public static arrayToObject(arr = [], keyProperty?: string | ((o: any) => string), valueProperty?: string | ((o: any) => any)) {
    const key = typeof keyProperty === 'string' ? (o: any) => o[keyProperty] : keyProperty;
    const value = typeof valueProperty === 'string' ? (o: any) => o[valueProperty] : valueProperty;
    return arr.reduce((acc, cur, i) => {
      acc[key ? key(cur) : i] = value ? value(cur) : cur;
      return acc;
    }, {});
  }

  public static navigate(newTab: boolean, router: Router, commands: any[], navigationExtras?: NavigationExtras): Promise<any> {
    if (newTab) {
      return new Promise(() => Utils.openWindow(router.serializeUrl(router.createUrlTree(commands, navigationExtras))));
    } else {
      return router.navigate(commands, navigationExtras);
    }
  }

  public static openWindow(url: string = '', target = '_blank', features?: string, replace?: boolean): Window {
    return window.open(url.match(new RegExp('^/.+')) ? url.replace(new RegExp('^/'), '') : url, target, features, replace); // relative to host
  }
}
