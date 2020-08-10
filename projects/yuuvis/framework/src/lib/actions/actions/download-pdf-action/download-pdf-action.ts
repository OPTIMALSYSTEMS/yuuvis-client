import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService, DmsObject, TranslateService } from '@yuuvis/core';
import { Observable, of as observableOf, of } from 'rxjs';
import { DmsObjectTarget } from '../../action-target';
import { SimpleAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';

/**
 * @ignore
 */

@Component({
  selector: 'yuv-download-content-pdf',
  template: ``
})
export class DownloadPdfActionComponent extends DmsObjectTarget implements SimpleAction {
  label: string;
  description: string;
  priority = 2;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;
  static isSubAction = true;

  constructor(private translate: TranslateService, private backend: BackendService, private router: Router) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.export.pdf.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.export.pdf.description');
  }

  isExecutable(item: DmsObject) {
    return observableOf(!!item.content);
  }

  run(selection: DmsObject[]): Observable<boolean> {
    // const isVersionState = this.router.url.startsWith('/versions');
    // this.backend.downloadContent(selection, 'PDF', isVersionState);
    return of(true);
  }
}
