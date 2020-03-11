import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { SystemType } from '../system/system.enum';
import { SystemService } from '../system/system.service';
import { ColumnConfig } from './user-config.interface';

/**
 * Service for accessing and managing user configurations.
 */
@Injectable({
  providedIn: 'root'
})
export class UserConfigService {
  constructor(private backend: BackendService, private systemService: SystemService) {}

  getColumnConfig(objectTypeId?: string): Observable<ColumnConfig> {
    return this.backend.get(`/user/config/result/${encodeURIComponent(objectTypeId || SystemType.OBJECT)}`).pipe(
      map(res => ({
        type: res.type,
        columns: res.columns.map(c => ({
          id: c.id,
          label: this.systemService.getLocalizedResource(`${c.id}_label`),
          pinned: c.pinned,
          sort: c.sort ? c.sort.order : null
        }))
      }))
    );
  }

  saveColumnConfig(columnConfig: ColumnConfig): Observable<any> {
    return this.backend.post(`/user/config/result/${encodeURIComponent(columnConfig.type)}`, {
      type: columnConfig.type,
      columns: columnConfig.columns.map(c => ({
        id: c.id,
        pinned: c.pinned,
        sort: {
          order: c.sort
        }
      }))
    });
  }
}
