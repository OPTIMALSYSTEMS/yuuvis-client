import { Component } from '@angular/core';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { of as observableOf } from 'rxjs';
import { editLocation } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { SelectionRange } from '../../selection-range.enum';
import { ExternalComponentAction } from './../../interfaces/action.interface';
import { MoveComponent } from './move/move.component';

@Component({
  selector: 'yuv-move-action',
  template: ``
})
export class MoveActionComponent extends DmsObjectTarget implements ExternalComponentAction {
  header: string;
  label: string;
  description: string;
  priority = 9;
  iconSrc = editLocation.data;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;
  extComponent = MoveComponent;

  constructor(private translate: TranslateService) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.move.dms.object.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.move.dms.object.description');
  }

  isExecutable(element: DmsObject) {
    return observableOf(element && element.rights && element.rights.writeIndexData);
  }
}
