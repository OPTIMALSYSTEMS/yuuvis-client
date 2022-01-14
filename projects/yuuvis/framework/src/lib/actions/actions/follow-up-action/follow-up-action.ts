import { Component } from '@angular/core';
import { BpmService, DmsObject, TranslateService } from '@yuuvis/core';
import { of as observableOf } from 'rxjs';
import { resubmission } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { ComponentAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';
import { FollowUpComponent } from './follow-up/follow-up.component';
/**
 * @ignore
 */
@Component({
  selector: 'yuv-follow-up-action',
  template: ``
})
export class FollowUpActionComponent extends DmsObjectTarget implements ComponentAction {
  header: string;
  label: string;
  description: string;
  priority = 3;
  iconSrc = resubmission.data;
  group = 'common';
  range = SelectionRange.SINGLE_SELECT;
  component = FollowUpComponent;

  constructor(private translate: TranslateService, private bpmService: BpmService) {
    super();
    this.label = this.translate.instant(`yuv.framework.action-menu.action.follow-up.label`);
    this.description = this.translate.instant(`yuv.framework.action-menu.action.follow-up.description`);
  }

  isExecutable(element: DmsObject) {
    return observableOf(this.bpmService.supports.followUp);
  }
}
