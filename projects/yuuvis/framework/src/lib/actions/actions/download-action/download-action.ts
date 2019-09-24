import { Component } from '@angular/core';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { of as observableOf } from 'rxjs';
import { SVGIcons } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { ListAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';
import { DownloadOriginalActionComponent } from '../download-original-action/download-original-action';

@Component({
  selector: 'yuv-download-content',
  template: ``
})
export class DownloadActionComponent extends DmsObjectTarget implements ListAction {
  header: string;
  label: string;
  description: string;
  priority = 2;
  iconSrc = SVGIcons['content-download'];
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