import { Component } from '@angular/core';
import { BaseObjectTypeField, DmsObject, RetentionState, SystemService, SystemSOT, TranslateService, UserService } from '@yuuvis/core';
import { of } from 'rxjs';
import { retention } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { SelectionRange } from '../../selection-range.enum';
import { ComponentAction } from './../../interfaces/action.interface';
import { RetentionProlongComponent } from './retention-prolong/retention-prolong.component';

/**
 * @ignore
 */
@Component({
  selector: 'yuv-retention-prolong-action',
  template: ``
})
export class RetentionProlongActionComponent extends DmsObjectTarget implements ComponentAction {
  header: string;
  label: string;
  description: string;
  priority = 9;
  iconSrc = retention.data;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;
  component = RetentionProlongComponent;

  constructor(private translate: TranslateService, private userService: UserService, private system: SystemService) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.retention-prolong.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.retention-prolong.description');
  }

  isExecutable(element: DmsObject) {
    return of(element && !element.isFolder && element.rights && element.rights.writeIndexData && this.supportsProlongRetention(element));
  }

  private supportsProlongRetention(e: DmsObject): boolean {
    const hasRetentionSOT = e.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]?.includes(SystemSOT.DESTRUCTION_RETENTION);
    const retentionState = e.getRetentionState();
    return this.userService.isRetentionManager && hasRetentionSOT && retentionState !== RetentionState.NONE;
  }
}
