import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { of as observableOf } from 'rxjs';
import { SVGIcons } from '../../../svg.generated';
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
  iconSrc = SVGIcons['delete'];
  group = 'further';
  range = SelectionRange.SINGLE_SELECT;
  component = DeleteComponent;

  constructor(private translate: TranslateService, private router: Router) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.description');
  }

  isExecutable(element: DmsObject) {
    //todo: add condition when properties exists
    // const isLocked = element.lock && element.lock.by.other;
    // return observableOf(element && !element.isFinalized && element.rights && element.rights.recycle && !isLocked && this.isAllowedState());
    return observableOf(true);
  }

  // isAllowedState() {
  //   const disabledStates = ['/favorites', '/inbox', '/process', '/versions', '/notifications'];
  //   return !disabledStates.some(s => this.router.url.startsWith(s));
  // }
}
