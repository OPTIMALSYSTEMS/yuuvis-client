import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { ConfigService } from '../config/config.service';
import { SecondaryObjectTypeClassification, SystemType } from '../system/system.enum';
import { ObjectType, ObjectTypeField } from '../system/system.interface';
import { SystemService } from '../system/system.service';
import { UserService } from '../user/user.service';
import { ColumnConfig } from './user-config.interface';

/**
 * Service for accessing and managing user configurations.
 */
@Injectable({
  providedIn: 'root'
})
export class UserConfigService {
  get hasManageSettingsRole() {
    return this.userService.hasManageSettingsRole;
  }

  /**
   * @ignore
   */
  constructor(private backend: BackendService, private systemService: SystemService, private userService: UserService) {}

  /**
   * Get the column configuration for a given object type.
   * Also supports floating types.
   */
  getColumnConfig(objectTypeId?: string, global?: boolean): Observable<ColumnConfig> {
    // Abstract types like `system:document` or `system:folder` should also fall back to the
    // mixed column configurations
    const abstractTypes = Object.values(SystemType);
    const objectType: ObjectType =
      !objectTypeId || abstractTypes.includes(objectTypeId) ? this.systemService.getBaseType(true) : this.systemService.getObjectType(objectTypeId);
    const objectTypeFields = {};
    objectType.fields.forEach((f: ObjectTypeField) => (objectTypeFields[f.id] = f));

    return this.fetchColumnConfig(objectType.id, global).pipe(
      // maybe there are columns that do not match the type definition anymore
      map((cc: ColumnConfig) => ({ ...cc, columns: cc.columns.filter((c) => !!objectTypeFields[c.id]), fields: objectTypeFields }))
    );
  }

  private fetchColumnConfig(objectTypeId: string, global?: boolean): Observable<ColumnConfig> {
    return this.backend.get(this.getRequestURI(objectTypeId, global)).pipe(
      map((res) => ({
        type: objectTypeId,
        columns: (res.columns || []).map((c) => ({
          id: c.id,
          label: this.systemService.getLocalizedResource(`${c.id}_label`),
          pinned: c.pinned || false,
          sort: c.sort && c.sort.order ? c.sort.order : null
        }))
      }))
    );
  }

  /**
   * save result list configuration of available objects
   */
  saveColumnConfig(columnConfig: ColumnConfig, global?: boolean): Observable<any> {
    return this.backend.post(this.getRequestURI(columnConfig.type, global && this.hasManageSettingsRole), {
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
  private getRequestURI(objectTypeId: string, global?: boolean): string {
    const baseURL = global ? '/user/globalsettings/column-config-' : '/user/config/result/';
    const ot = this.systemService.getObjectType(objectTypeId);

    if (!global && ot?.floatingParentType) {
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

  resetColumnConfig(objectTypeId: string) {
    return this.saveColumnConfig({ type: objectTypeId, columns: [] });
  }

  private generateMainJsonUri() {
    return this.backend.get(ConfigService.GLOBAL_MAIN_CONFIG).pipe(
      map((data) => {
        const blob = new Blob([JSON.stringify(data || {}, null, 2)], { type: 'text/json' });
        const uri = URL.createObjectURL(blob);
        // setTimeout(() => URL.revokeObjectURL(uri), 10000);
        return uri;
      })
    );
  }

  /**
   * make it possible for users to export their main config as a json file
   *
   */
  exportMainConfig(filename = 'main.json') {
    this.generateMainJsonUri().subscribe((uri) => this.backend.download(uri, filename));
  }

  importMainConfig(data: string | any) {
    const config = typeof data === 'string' ? JSON.parse(data) : data;
    return this.hasManageSettingsRole ? this.backend.post(ConfigService.GLOBAL_MAIN_CONFIG, config) : of();
  }
}
