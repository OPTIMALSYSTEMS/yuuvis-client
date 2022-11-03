import { Component } from '@angular/core';
import { ContentStreamAllowed, DmsObject, RetentionState, SystemService, TranslateService } from '@yuuvis/core';
import { of as observableOf } from 'rxjs';
import { contentUpload } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { ComponentAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';
import { UploadComponent } from './upload/upload.component';
/**
 * @ignore
 */
@Component({
  selector: 'yuv-upload-action',
  template: ``
})
export class UploadActionComponent extends DmsObjectTarget implements ComponentAction {
  header: string;
  label: string;
  description: string;
  priority = 2;
  iconSrc = contentUpload.data;
  group = 'common';
  range = SelectionRange.SINGLE_SELECT;
  component = UploadComponent;

  constructor(private translate: TranslateService, private system: SystemService) {
    super();
  }

  isExecutable(element: DmsObject) {
    const { objectTypeId, content } = element;
    const objectType = this.system.getObjectType(objectTypeId);
    if (content) {
      this.label = this.translate.instant(`yuv.framework.action-menu.action.upload.dms.object.content.replace.label`);
      this.description = this.translate.instant(`yuv.framework.action-menu.action.upload.dms.object.content.replace.description`);
    } else {
      this.label = this.translate.instant('yuv.framework.action-menu.action.upload.dms.object.content.add.label');
      this.description = this.translate.instant('yuv.framework.action-menu.action.upload.dms.object.content.add.description');
    }
    const retentionState = element?.getRetentionState();
    return observableOf(
      element?.rights?.writeContent &&
      objectType?.contentStreamAllowed !== ContentStreamAllowed.NOT_ALLOWED &&
      retentionState !== RetentionState.ACTIVE &&
      retentionState !== RetentionState.DESTRUCT
    );
  }
}
