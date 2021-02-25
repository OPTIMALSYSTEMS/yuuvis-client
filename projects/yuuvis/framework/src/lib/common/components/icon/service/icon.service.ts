import { Injectable } from '@angular/core';
import { BackendService } from '@yuuvis/core';
import { Observable } from 'rxjs';

/**
 * @ignore
 * IconService get and injects the icons.
 */
@Injectable()
export class IconService {
  /**
   * @ignore
   *
   */
  constructor(private backend: BackendService) {}

  fetch(uri: string): Observable<any> {
    return this.backend.getViaCache(uri);
  }
}
