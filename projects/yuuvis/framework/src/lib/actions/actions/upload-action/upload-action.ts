import { Component } from '@angular/core';
import { ContentStreamAllowed, DmsObject, SystemService, TranslateService } from '@yuuvis/core';
import { of as observableOf } from 'rxjs';
import { contentUpload } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { ComponentAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';
import { UploadComponent } from './upload/upload.component';

/**
 * This low level component update for the view a replaced content of selected  object and doesn't have any `Inputs()` or `Outputs()`.
 *
 * @example
 * <yuv-update></yuv-update>
 *
 */

@Component({
  selector: 'yuv-update',
  template: ``
})
export class UploadActionComponent extends DmsObjectTarget implements ComponentAction {
  header: string;
  label: string;
  description: string;
  priority = 7;
  iconSrc = contentUpload.data;
  group = 'common';
  range = SelectionRange.SINGLE_SELECT;
  component = UploadComponent;

  constructor(private translate: TranslateService, private system: SystemService) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.upload.dms.object.content.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.upload.dms.object.content.description');
  }

  isExecutable(element: DmsObject) {
    const objectType = this.system.getObjectType(element.objectTypeId);
    return observableOf(
      element.rights && element.rights.writeContent && objectType.contentStreamAllowed && objectType.contentStreamAllowed !== ContentStreamAllowed.NOT_ALLOWED
    );
  }
}
