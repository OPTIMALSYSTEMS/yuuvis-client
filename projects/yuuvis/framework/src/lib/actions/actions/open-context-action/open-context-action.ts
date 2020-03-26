import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { Observable, of as observableOf } from 'rxjs';
import { openContext } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { LinkAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';

@Component({
  selector: 'yuv-open-context-action',
  template: ``
})
export class OpenContextActionComponent extends DmsObjectTarget implements LinkAction {
  label: string;
  description: string;
  priority = 3.5;
  iconSrc = openContext.data;
  group = 'common';
  range = SelectionRange.SINGLE_SELECT;
  latestVersion: number;

  constructor(private translate: TranslateService, private router: Router, private route: ActivatedRoute) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.open.context');
    this.description = this.translate.instant('yuv.framework.action-menu.action.open.context.description');
    this.latestVersion = parseInt(this.route.snapshot.fragment, 0);
  }

  isExecutable(item: DmsObject): Observable<boolean> {
    return observableOf(this.latestVersion ? this.latestVersion === item.version : true);
  }

  getParams(selection: DmsObject[]) {
    return {};
  }

  getLink(selection: DmsObject[]): string {
    const { id, isFolder, contextFolder } = selection[0];
    if (isFolder) {
      this.label = this.translate.instant('yuv.framework.action-menu.action.open');
    }
    return `/object/${id}`;
  }
}
