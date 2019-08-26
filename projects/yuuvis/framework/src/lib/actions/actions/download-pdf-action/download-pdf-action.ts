import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService, DmsObject, TranslateService } from '@yuuvis/core';
import { Observable, of as observableOf, of } from 'rxjs';
import { DmsObjectTarget } from '../../action-target';
import { SimpleAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';

@Component({
  selector: 'eo-download-content-pdf',
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
    this.label = this.translate.instant('eo.export.action.pdf.label');
    this.description = this.translate.instant('eo.export.action.pdf.description');
  }

  isExecutable(item: DmsObject) {
    // return observableOf(!!item.content && !!item.content.id && this.allowedItemType(item.content.contents));
    return observableOf(true);
  };

  allowedItemType(contents) {
    return !!contents && contents.length && (!contents[0].mimegroup || !contents[0].mimegroup.match(/^audio|^video/));
  }

  run(selection: DmsObject[]): Observable<boolean> {
    const isVersionState = this.router.url.startsWith('/versions');
    // this.backend.downloadContent(selection, 'PDF', isVersionState);
    return of(true);
  }
}
