import { Component } from '@angular/core';
import { DmsObject, DmsService, TranslateService } from '@yuuvis/core';
import { DmsObjectTarget, SelectionRange, SimpleAction, versions } from '@yuuvis/framework';
import { Observable, of as observableOf, of } from 'rxjs';

/**
 * @ignore
 */
@Component({
  selector: 'yuv-restore-action',
  template: ``
})
export class RestoreActionComponent extends DmsObjectTarget implements SimpleAction {
  header: string;
  label: string;
  description: string;
  priority = 10;
  iconSrc = versions.data;
  group = 'common';
  range = SelectionRange.SINGLE_SELECT;
  subActionComponents: any[];

  constructor(private translate: TranslateService, private dmsService: DmsService) {
    super();
    this.label = this.translate.instant('yuv.client.action.restore.dms.object.label');
    this.description = this.translate.instant('yuv.client.action.restore.dms.object.description');
  }

  isExecutable(element: DmsObject) {
    const validState = !!location.pathname.match('/versions');
    return observableOf(validState && !!element);
  }

  run(selection: DmsObject[]): Observable<boolean> {
    this.dmsService.restoreDmsObject(selection[0].id, selection[0].version).subscribe();
    return of(true);
  }
}
