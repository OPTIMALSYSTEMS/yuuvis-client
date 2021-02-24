import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Utils } from '../../util/utils';
import { BackendService } from '../backend/backend.service';
import { ConfigService } from '../config/config.service';
import { SecondaryObjectTypeClassification, SystemType } from '../system/system.enum';
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

  get hasSystemRole() {
    return this.userService.hasSystemRole;
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
    const resolvedType = this.systemService.getResolvedType(objectTypeId);
    const objectTypeFields = Utils.arrayToObject(resolvedType.fields, 'id');

    return this.fetchColumnConfig(resolvedType.id, global).pipe(
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
    const id = encodeURIComponent(objectTypeId);
    if (global) {
      return `/user/globalsettings/column-config-${id}`;
    }
    const baseURL = '/user/config/result/';
    const ot = this.systemService.getObjectType(objectTypeId);
    if (!ot && this.systemService.getSecondaryObjectType(objectTypeId)) {
      // Not getting an object type means that the target type is an extendable FSOT.
      // In this case we'll use the base objects id to store the column config
      return `${baseURL}${encodeURIComponent(SystemType.OBJECT)}?fallback=${id}&sots=${objectTypeId}`;
    } else if (ot?.floatingParentType) {
      const parentType = this.systemService.getObjectType(ot.floatingParentType);
      const sots: string[] = [objectTypeId].concat(
        ...parentType.secondaryObjectTypes
          .map((sot) => this.systemService.getSecondaryObjectType(sot.id))
          .filter((sot) => sot.classification?.includes(SecondaryObjectTypeClassification.REQUIRED))
          .map((sot) => sot.id)
      );

      return `${baseURL}${encodeURIComponent(ot.floatingParentType)}?fallback=${id}&sots=${sots.map((sot) => encodeURIComponent(sot)).join('&sots=')}`;
    } else {
      return `${baseURL}${id}?fallback=${id}`;
    }
  }

  resetColumnConfig(objectTypeId: string) {
    return this.saveColumnConfig({ type: objectTypeId, columns: [] });
  }

  private generateMainJsonUri(uri = ConfigService.GLOBAL_MAIN_CONFIG) {
    return this.backend.get(uri).pipe(
      map((data) => {
        const blob = new Blob([JSON.stringify(data || {}, null, 2)], { type: 'text/json' });
        const _uri = URL.createObjectURL(blob);
        // setTimeout(() => URL.revokeObjectURL(_uri), 10000);
        return _uri;
      })
    );
  }

  /**
   * make it possible for users to export their main config as a json file
   *
   */
  exportMainConfig(filename = 'main.json', uri = ConfigService.GLOBAL_MAIN_CONFIG) {
    this.generateMainJsonUri(uri).subscribe((_uri) => this.backend.download(_uri, filename));
  }

  importMainConfig(data: string | any, uri = ConfigService.GLOBAL_MAIN_CONFIG, force = false) {
    const config = typeof data === 'string' ? JSON.parse(data) : data;
    if (uri === ConfigService.GLOBAL_MAIN_CONFIG && !config.core && !config.client) {
      throw new Error('Invalid main configuration');
      return of();
    }
    return force || this.hasSystemRole ? this.backend.post(uri, config) : of();
  }

  exportLanguage(iso = 'en') {
    this.exportMainConfig(iso + '.json', ConfigService.GLOBAL_MAIN_CONFIG_LANG(iso));
  }

  importLanguage(data: string | any, iso = 'en') {
    return this.importMainConfig(data, ConfigService.GLOBAL_MAIN_CONFIG_LANG(iso));
  }
}
