import { Component } from '@angular/core';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { of as observableOf } from 'rxjs';
import { resubmission } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { ComponentAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';
import { TaskflowStartComponent } from './taskflow-start/taskflow-start.component';
/**
 * @ignore
 */
@Component({
  selector: 'yuv-taskflow-action',
  template: ``
})
export class TaskFlowActionComponent extends DmsObjectTarget implements ComponentAction {
  header: string;
  label: string;
  description: string;
  priority = 3;
  iconSrc = resubmission.data;
  group = 'common';
  range = SelectionRange.SINGLE_SELECT;
  component = TaskflowStartComponent;

  constructor(private translate: TranslateService) {
    super();
    this.label = this.translate.instant(`yuv.framework.action-menu.action.taskflow.label`);
    this.description = this.translate.instant(`yuv.framework.action-menu.action.taskflow.description`);
  }

  isExecutable(element: DmsObject) {
    return observableOf(true);
  }
}
