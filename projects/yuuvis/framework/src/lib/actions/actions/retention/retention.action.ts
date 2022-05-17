import { Component } from '@angular/core';
import { DmsObject, RetentionState, SystemService, SystemSOT, TranslateService, UserService } from '@yuuvis/core';
import { of } from 'rxjs';
import { retention } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { SelectionRange } from '../../selection-range.enum';
import { ComponentAction } from './../../interfaces/action.interface';
import { RetentionStartComponent } from './retention-start/retention-start.component';

/**
 * @ignore
 */
@Component({
  selector: 'yuv-retention-action',
  template: ``
})
export class RetentionActionComponent extends DmsObjectTarget implements ComponentAction {
  header: string;
  label: string;
  description: string;
  priority = 9;
  iconSrc = retention.data;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;
  component = RetentionStartComponent;

  constructor(private translate: TranslateService, private userService: UserService, private system: SystemService) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.retention.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.retention.description');
  }

  isExecutable(element: DmsObject) {
    return of(element && !element.isFolder && element.rights && element.rights.writeIndexData && this.supportsRetention(element));
  }

  private supportsRetention(e: DmsObject): boolean {
    // does the object type support retention
    const ot = this.system.getObjectType(e.objectTypeId);
    const typeSupportsRetention = ot.secondaryObjectTypes.map((s) => s.id).includes(SystemSOT.DESTRUCTION_RETENTION);
    const retentionState = e.getRetentionState();
    return this.userService.isRetentionManager && typeSupportsRetention && retentionState === RetentionState.NONE;
  }
}
