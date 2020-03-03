import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { ColumnConfig } from './user-config.interface';

/**
 * Service for accessing and managing user configurations.
 */
@Injectable({
  providedIn: 'root'
})
export class UserConfigService {
  constructor(private backend: BackendService) {}

  getColumnConfig(objectTypeId: string): Observable<ColumnConfig> {
    return this.backend.get(`/user/config/result/${encodeURIComponent(objectTypeId)}`).pipe(
      map(res => ({
        type: res.type,
        columns: res.columns
      }))
    );
  }

  saveColumnConfig(columnConfig: ColumnConfig): Observable<any> {
    return this.backend.post(`/user/config/result/${encodeURIComponent(columnConfig.type)}`);
  }
}
