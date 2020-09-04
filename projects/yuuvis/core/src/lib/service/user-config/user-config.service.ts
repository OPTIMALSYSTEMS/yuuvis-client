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
  /**
   * @ignore
   */
  constructor(private backend: BackendService, private systemService: SystemService) {}

  /**
   * Get the column configuration for a given object type.
   * Also supports floating types.
   */
  getColumnConfig(objectTypeId?: string): Observable<ColumnConfig> {
    // skip abstract object types
    const ot = this.systemService.getObjectType(objectTypeId);
    let otid = ot?.creatable ? objectTypeId : SystemType.OBJECT;
    const url = ot?.floatingParentType
      ? `/user/config/result/${encodeURIComponent(ot.floatingParentType)}?sots=${encodeURIComponent(ot.id)}`
      : `/user/config/result/${encodeURIComponent(otid)}`;

    return this.backend.get(url).pipe(
      map((res) => ({
        type: otid,
        columns: res.columns.map((c) => ({
          id: c.id,
          label: this.systemService.getLocalizedResource(`${c.id}_label`),
          pinned: c.pinned,
          sort: c.sort ? c.sort.order : null
        }))
      }))
    );
  }
  /**
   * save result list configuration of available objects
   */
  saveColumnConfig(columnConfig: ColumnConfig): Observable<any> {
    const ot = this.systemService.getObjectType(columnConfig.type);
    const url = ot?.floatingParentType
      ? `/user/config/result/${encodeURIComponent(ot.floatingParentType)}?sots=${encodeURIComponent(ot.id)}`
      : `/user/config/result/${encodeURIComponent(ot.id)}`;
    return this.backend.post(url, {
      type: columnConfig.type,
      columns: columnConfig.columns.map((c) => ({
        id: c.id,
        pinned: c.pinned,
        sort: {
          order: c.sort
        }
      }))
    });
  }
}
