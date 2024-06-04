import { HttpErrorResponse } from '@angular/common/http';

/**
 * @ignore
 */
export class YuvError implements Error {

  get name() {
    return this._name || this.originalError.name || '';
  }

  get message() {
    return this._message || this.originalError.message || '';
  }

  get stack() {
    return this.originalError.stack;
  }

  get status() {
    return this.originalError.status;
  }

  get url() {
    return this.originalError.url;
  }

  get skipNotification() {
    return this._skipNotification === undefined ? !!this.originalError.skipNotification : this._skipNotification;
  }

  get isHttpErrorResponse() {
    return this.originalError.isHttpErrorResponse || this.originalError instanceof HttpErrorResponse;
  }

  constructor(public originalError: any | Error, private _name: string, private _message: string, private _skipNotification: boolean) {
  }

  toString() {
    return this.originalError.toString();
  }
}
