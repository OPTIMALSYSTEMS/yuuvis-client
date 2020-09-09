import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { SecondaryObjectTypeClassification, SystemType } from '../system/system.enum';
import { ObjectType, ObjectTypeField } from '../system/system.interface';
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
    // Abstract types like `system:document` or `system:folder` should also fall back to the
    // mixed column configuration
    const abstractTypes = [SystemType.DOCUMENT, SystemType.FOLDER];
    const objectType: ObjectType =
      !objectTypeId || abstractTypes.includes(objectTypeId) ? this.systemService.getBaseType(true) : this.systemService.getObjectType(objectTypeId);
    const objectTypeFields = {};
    objectType.fields.forEach((f: ObjectTypeField) => (objectTypeFields[f.id] = f));

    return this.fetchColumnConfig(objectType.id).pipe(
      // maybe there are columns that do not match the type definition anymore
      map((cc: ColumnConfig) => ({ ...cc, columns: cc.columns.filter((c) => !!objectTypeFields[c.id]) }))
    );
  }

  private fetchColumnConfig(objectTypeId: string): Observable<ColumnConfig> {
    return this.backend.get(this.getRequestURI(objectTypeId)).pipe(
      map((res) => ({
        type: objectTypeId,
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
    return this.backend.post(this.getRequestURI(columnConfig.type), {
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

  /**
   * Generate request URI for getting and setting an object types column configuration
   * @param objectType ID of the desired object type
   */
  private getRequestURI(objectTypeId: string): string {
    const baseURL = '/user/config/result/';
    const ot = this.systemService.getObjectType(objectTypeId);

    if (ot?.floatingParentType) {
      const parentType = this.systemService.getObjectType(ot.floatingParentType);
      const sots: string[] = [objectTypeId].concat(
        ...parentType.secondaryObjectTypes
          .map((sot) => this.systemService.getSecondaryObjectType(sot.id))
          .filter((sot) => sot.classification?.includes(SecondaryObjectTypeClassification.REQUIRED))
          .map((sot) => sot.id)
      );

      return `${baseURL}${encodeURIComponent(ot.floatingParentType)}?sots=${sots.map((sot) => encodeURIComponent(sot)).join('&sots=')}`;
    } else {
      return `${baseURL}${encodeURIComponent(objectTypeId)}`;
    }
  }
}
