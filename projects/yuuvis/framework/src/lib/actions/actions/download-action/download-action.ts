import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService, DmsObject, TranslateService } from '@yuuvis/core';
import { Observable, of as observableOf, of } from 'rxjs';
import { contentDownload } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { SimpleAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';

/**
 * @ignore
 */
@Component({
  selector: 'yuv-download-action',
  template: ``
})
export class DownloadActionComponent extends DmsObjectTarget implements SimpleAction {
  header: string;
  label: string;
  description: string;
  priority = 2;
  iconSrc = contentDownload.data;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;
  subActionComponents: any[];

  constructor(private translate: TranslateService, private backend: BackendService, private route: ActivatedRoute) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.download.dms.object.content.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.download.dms.object.content.description');
    this.header = this.translate.instant('yuv.framework.action-menu.action.export.title');
  }

  isExecutable(element: DmsObject) {
    return observableOf(!!element.content);
  }

  run(selection: DmsObject[]): Observable<boolean> {
    this.backend.downloadContent(selection, !!this.route.snapshot.queryParams.version);
    return of(true);
  }
}
