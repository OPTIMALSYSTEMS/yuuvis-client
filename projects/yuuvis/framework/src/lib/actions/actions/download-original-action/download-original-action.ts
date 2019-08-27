
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService, DmsObject, TranslateService } from '@yuuvis/core';
import { Observable, of as observableOf, of } from 'rxjs';
import { DmsObjectTarget } from '../../action-target';
import { SimpleAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';

@Component({
  selector: 'eo-download-content-original',
  template: ``
})
export class DownloadOriginalActionComponent extends DmsObjectTarget implements SimpleAction {
  label: string;
  description: string;
  priority = 1;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;
  static isSubAction = true;

  constructor(private translate: TranslateService, private backend: BackendService, private router: Router) {
    super();
    this.label = this.translate.instant('eo.export.action.original.label');
    this.description = this.translate.instant('eo.export.action.original.description');
  }

  isExecutable(item: DmsObject) {
    // return observableOf(!!item.content && !!item.content.id);
    return observableOf(true);
  };

  run(selection: DmsObject[]): Observable<boolean> {
    this.backend.downloadContent(selection.map(o => o.id));
    return of(true);
  }
}
