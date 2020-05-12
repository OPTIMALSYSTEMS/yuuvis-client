import { Component } from '@angular/core';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { of as observableOf } from 'rxjs';
import { contentDownload } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { ListAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';
import { DownloadOriginalActionComponent } from '../download-original-action/download-original-action';

/**
 * This component is a part of the action menu and is responsible for download files of selected objects. This component doesn't have any `Inputs()` or `Outputs()`.
 *
 * [Screenshot](../assets/images/yuv-download-action.gif)
 *
 * @example
 * <yuv-download-content></yuv-download-content>
 *
 */

@Component({
  selector: 'yuv-download-content',
  template: ``
})
export class DownloadActionComponent extends DmsObjectTarget implements ListAction {
  header: string;
  label: string;
  description: string;
  priority = 2;
  iconSrc = contentDownload.data;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;
  subActionComponents: any[];

  constructor(private translate: TranslateService) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.download.dms.object.content.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.download.dms.object.content.description');
    this.header = this.translate.instant('yuv.framework.action-menu.action.export.title');
    // this.subActionComponents = [DownloadOriginalActionComponent, DownloadPdfActionComponent];
    this.subActionComponents = [DownloadOriginalActionComponent];
  }

  isExecutable(element: DmsObject) {
    return observableOf(!!element.content);
  }
}
