import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService, DmsObject, TranslateService } from '@yuuvis/core';
import { Observable, of as observableOf, of } from 'rxjs';
import { DmsObjectTarget } from '../../action-target';
import { SimpleAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';

/**
 * @ignore
 */
@Component({
  selector: 'yuv-download-content-original',
  template: ``
})
export class DownloadOriginalActionComponent extends DmsObjectTarget implements SimpleAction {
  static isSubAction = true;
  label: string;
  description: string;
  priority = 1;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;

  constructor(private translate: TranslateService, private backend: BackendService, private route: ActivatedRoute) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.export.original.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.export.original.description');
  }

  isExecutable(item: DmsObject) {
    return observableOf(!!item.content);
  }

  run(selection: DmsObject[]): Observable<boolean> {
    this.backend.downloadContent(selection, !!this.route.snapshot.queryParams.version);
    return of(true);
  }
}
