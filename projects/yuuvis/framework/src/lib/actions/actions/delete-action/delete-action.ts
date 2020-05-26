import { Component } from '@angular/core';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { of as observableOf } from 'rxjs';
import { deleteIcon } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { ComponentAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';
import { DeleteComponent } from './delete/delete.component';

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

  constructor(private translate: TranslateService) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.description');
  }

  isExecutable(element: DmsObject) {
    return observableOf(element && element.rights && element.rights.deleteObject);
  }
}
