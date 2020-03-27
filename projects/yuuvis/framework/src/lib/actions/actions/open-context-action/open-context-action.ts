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

  constructor(private translate: TranslateService, private router: Router, private route: ActivatedRoute) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.open.context');
    this.description = this.translate.instant('yuv.framework.action-menu.action.open.context.description');
  }

  isExecutable(item: DmsObject): Observable<boolean> {
    const isLatestVersion = this.route.snapshot.queryParams.version ? this.route.snapshot.fragment === item.version.toString() : true;
    const isNotSameObjectState = !('/' + this.route.snapshot.url.map(a => a.path).join('/')).match(this.getLink([item]));
    return observableOf(isNotSameObjectState && isLatestVersion);
  }

  getFragment(selection: DmsObject[]) {
    const { id, isFolder, parentId } = selection[0];
    return isFolder || !parentId ? null : id;
  }

  getLink(selection: DmsObject[]) {
    const { id, isFolder, parentId } = selection[0];
    if (isFolder || !parentId) {
      this.label = this.translate.instant('yuv.framework.action-menu.action.open');
    }
    return `/object/${isFolder || !parentId ? id : parentId}`;
  }
}
