import { EMPTY as observableEmpty, throwError as observableThrowError } from 'rxjs';
import { YuvError } from '../model/yuv-error.model';
import { Sort } from './utils.helper.enum';

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
      .filter(k => params[k] || params[k] === 0)
      .map(k => k + '=' + encodeURIComponent(params[k]))
      .join('&');
    return uri + (q ? '?' + q : '');
  }

  /**
   * Creates a unique identifier.
   * @returns A Universally Unique Identifier
   */
  public static uuid(): string {
    return Utils._p8() + Utils._p8(true) + Utils._p8(true) + Utils._p8();
  }

  public static md5(s) {
    function L(k, d) {
      return (k << d) | (k >>> (32 - d));
    }
    function K(G, k) {
      var I, d, F, H, x;
      F = G & 2147483648;
      H = k & 2147483648;
      I = G & 1073741824;
      d = k & 1073741824;
      x = (G & 1073741823) + (k & 1073741823);
      if (I & d) {
        return x ^ 2147483648 ^ F ^ H;
      }
      if (I | d) {
        if (x & 1073741824) {
          return x ^ 3221225472 ^ F ^ H;
        } else {
          return x ^ 1073741824 ^ F ^ H;
        }
      } else {
        return x ^ F ^ H;
      }
    }
    function r(d, F, k) {
      return (d & F) | (~d & k);
    }
    function q(d, F, k) {
      return (d & k) | (F & ~k);
    }
    function p(d, F, k) {
      return d ^ F ^ k;
    }
    function n(d, F, k) {
      return F ^ (d | ~k);
    }
    function u(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(r(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function f(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(q(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function D(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(p(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function t(G, F, aa, Z, k, H, I) {
      G = K(G, K(K(n(F, aa, Z), k), I));
      return K(L(G, H), F);
    }
    function e(G) {
      var Z;
      var F = G.length;
      var x = F + 8;
      var k = (x - (x % 64)) / 64;
      var I = (k + 1) * 16;
      var aa = Array(I - 1);
      var d = 0;
      var H = 0;
      while (H < F) {
        Z = (H - (H % 4)) / 4;
        d = (H % 4) * 8;
        aa[Z] = aa[Z] | (G.charCodeAt(H) << d);
        H++;
      }
      Z = (H - (H % 4)) / 4;
      d = (H % 4) * 8;
      aa[Z] = aa[Z] | (128 << d);
      aa[I - 2] = F << 3;
      aa[I - 1] = F >>> 29;
      return aa;
    }
    function B(x) {
      var k = '',
        F = '',
        G,
        d;
      for (d = 0; d <= 3; d++) {
        G = (x >>> (d * 8)) & 255;
        F = '0' + G.toString(16);
        k = k + F.substr(F.length - 2, 2);
      }
      return k;
    }
    function J(k) {
      k = k.replace(/rn/g, 'n');
      var d = '';
      for (var F = 0; F < k.length; F++) {
        var x = k.charCodeAt(F);
        if (x < 128) {
          d += String.fromCharCode(x);
        } else {
          if (x > 127 && x < 2048) {
            d += String.fromCharCode((x >> 6) | 192);
            d += String.fromCharCode((x & 63) | 128);
          } else {
            d += String.fromCharCode((x >> 12) | 224);
            d += String.fromCharCode(((x >> 6) & 63) | 128);
            d += String.fromCharCode((x & 63) | 128);
          }
        }
      }
      return d;
    }
    var C = Array();
    var P, h, E, v, g, Y, X, W, V;
    var S = 7,
      Q = 12,
      N = 17,
      M = 22;
    var A = 5,
      z = 9,
      y = 14,
      w = 20;
    var o = 4,
      m = 11,
      l = 16,
      j = 23;
    var U = 6,
      T = 10,
      R = 15,
      O = 21;
    s = J(s);
    C = e(s);
    Y = 1732584193;
    X = 4023233417;
    W = 2562383102;
    V = 271733878;
    for (P = 0; P < C.length; P += 16) {
      h = Y;
      E = X;
      v = W;
      g = V;
      Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
      V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
      W = u(W, V, Y, X, C[P + 2], N, 606105819);
      X = u(X, W, V, Y, C[P + 3], M, 3250441966);
      Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
      V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
      W = u(W, V, Y, X, C[P + 6], N, 2821735955);
      X = u(X, W, V, Y, C[P + 7], M, 4249261313);
      Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
      V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
      W = u(W, V, Y, X, C[P + 10], N, 4294925233);
      X = u(X, W, V, Y, C[P + 11], M, 2304563134);
      Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
      V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
      W = u(W, V, Y, X, C[P + 14], N, 2792965006);
      X = u(X, W, V, Y, C[P + 15], M, 1236535329);
      Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
      V = f(V, Y, X, W, C[P + 6], z, 3225465664);
      W = f(W, V, Y, X, C[P + 11], y, 643717713);
      X = f(X, W, V, Y, C[P + 0], w, 3921069994);
      Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
      V = f(V, Y, X, W, C[P + 10], z, 38016083);
      W = f(W, V, Y, X, C[P + 15], y, 3634488961);
      X = f(X, W, V, Y, C[P + 4], w, 3889429448);
      Y = f(Y, X, W, V, C[P + 9], A, 568446438);
      V = f(V, Y, X, W, C[P + 14], z, 3275163606);
      W = f(W, V, Y, X, C[P + 3], y, 4107603335);
      X = f(X, W, V, Y, C[P + 8], w, 1163531501);
      Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
      V = f(V, Y, X, W, C[P + 2], z, 4243563512);
      W = f(W, V, Y, X, C[P + 7], y, 1735328473);
      X = f(X, W, V, Y, C[P + 12], w, 2368359562);
      Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
      V = D(V, Y, X, W, C[P + 8], m, 2272392833);
      W = D(W, V, Y, X, C[P + 11], l, 1839030562);
      X = D(X, W, V, Y, C[P + 14], j, 4259657740);
      Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
      V = D(V, Y, X, W, C[P + 4], m, 1272893353);
      W = D(W, V, Y, X, C[P + 7], l, 4139469664);
      X = D(X, W, V, Y, C[P + 10], j, 3200236656);
      Y = D(Y, X, W, V, C[P + 13], o, 681279174);
      V = D(V, Y, X, W, C[P + 0], m, 3936430074);
      W = D(W, V, Y, X, C[P + 3], l, 3572445317);
      X = D(X, W, V, Y, C[P + 6], j, 76029189);
      Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
      V = D(V, Y, X, W, C[P + 12], m, 3873151461);
      W = D(W, V, Y, X, C[P + 15], l, 530742520);
      X = D(X, W, V, Y, C[P + 2], j, 3299628645);
      Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
      V = t(V, Y, X, W, C[P + 7], T, 1126891415);
      W = t(W, V, Y, X, C[P + 14], R, 2878612391);
      X = t(X, W, V, Y, C[P + 5], O, 4237533241);
      Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
      V = t(V, Y, X, W, C[P + 3], T, 2399980690);
      W = t(W, V, Y, X, C[P + 10], R, 4293915773);
      X = t(X, W, V, Y, C[P + 1], O, 2240044497);
      Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
      V = t(V, Y, X, W, C[P + 15], T, 4264355552);
      W = t(W, V, Y, X, C[P + 6], R, 2734768916);
      X = t(X, W, V, Y, C[P + 13], O, 1309151649);
      Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
      V = t(V, Y, X, W, C[P + 11], T, 3174756917);
      W = t(W, V, Y, X, C[P + 2], R, 718787259);
      X = t(X, W, V, Y, C[P + 9], O, 3951481745);
      Y = K(Y, h);
      X = K(X, E);
      W = K(W, v);
      V = K(V, g);
    }
    var i = B(Y) + B(X) + B(W) + B(V);
    return i.toLowerCase();
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
    const f = error => {
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
    const f = error => {
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
    const f = error => {
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
    const f = error => {
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
   * Return the truncated string with a ... ending ot whats provided.
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
    return String(str).replace(/[&<>"'\/]/g, s => entityMap[s]);
  }

  public static arrayToObject(arr = [], keyProperty?: string | ((o: any) => string), valueProperty?: string | ((o: any) => any)) {
    const key = typeof keyProperty === 'string' ? (o: any) => o[keyProperty] : keyProperty;
    const value = typeof valueProperty === 'string' ? (o: any) => o[valueProperty] : valueProperty;
    return arr.reduce((acc, cur, i) => {
      acc[key ? key(cur) : i] = value ? value(cur) : cur;
      return acc;
    }, {});
  }
}
