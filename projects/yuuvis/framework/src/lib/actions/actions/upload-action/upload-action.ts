import { Component } from '@angular/core';
import { ContentStreamAllowed, DmsObject, SystemService, TranslateService } from '@yuuvis/core';
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
  selector: 'yuv-update',
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
    const { objectTypeId, rights, content } = element;
    const objectType = this.system.getObjectType(objectTypeId);
    if (content) {
      this.label = this.translate.instant(`yuv.framework.action-menu.action.upload.dms.object.content.replace.label`);
      this.description = this.translate.instant(`yuv.framework.action-menu.action.upload.dms.object.content.replace.description`);
    } else {
      this.label = this.translate.instant('yuv.framework.action-menu.action.upload.dms.object.content.add.label');
      this.description = this.translate.instant('yuv.framework.action-menu.action.upload.dms.object.content.add.description');
    }
    let isRetentionActive = false;
    if (element.data['system:rmStartOfRetention'] && element.data['system:rmExpirationDate']) {
      const currentDate = new Date();
      const retentionStart = new Date(element.data['system:rmStartOfRetention']);
      const retentionEnd = new Date(element.data['system:rmExpirationDate']);
      isRetentionActive = retentionStart <= currentDate && currentDate <= retentionEnd;
    }
    return observableOf(element?.rights?.writeContent && objectType?.contentStreamAllowed !== ContentStreamAllowed.NOT_ALLOWED && !isRetentionActive);
  }
}
