import { Component } from '@angular/core';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { of } from 'rxjs';
import { deleteIcon } from '../../../svg.generated';
import { ActionService } from '../../action-service/action.service';
import { DmsObjectTarget } from '../../action-target';
import { ComponentAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';
import { DeleteComponent } from './delete/delete.component';

/**
 * @ignore
 */

@Component({
  selector: 'yuv-delete-action',
  template: ``
})
export class DeleteActionComponent extends DmsObjectTarget implements ComponentAction {
  header: string;
  label: string;
  description: string;
  priority = 8;
  iconSrc = deleteIcon.data;
  group = 'common';
  range = SelectionRange.SINGLE_SELECT;
  component = DeleteComponent;

  constructor(private actionService: ActionService, private translate: TranslateService) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.description');
  }

  isExecutable(element: DmsObject) {
    return of(this.actionService.isExecutableSync('yuv-delete-action', element));
  }
}
