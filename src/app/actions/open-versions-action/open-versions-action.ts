import { Component } from '@angular/core';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { ActionService, DmsObjectTarget, LinkAction, SelectionRange, versions } from '@yuuvis/framework';
import { of } from 'rxjs';

@Component({
  selector: 'yuv-open-versions-action',
  template: ``
})
export class OpenVersionsActionComponent extends DmsObjectTarget implements LinkAction {
  label: string;
  description: string;
  priority = 6;
  iconSrc = versions.data;
  group = 'common';
  range = SelectionRange.SINGLE_SELECT;

  constructor(private actionService: ActionService, private translate: TranslateService) {
    super();
    this.label = this.translate.instant('yuv.client.action.open.versions');
    this.description = this.translate.instant('yuv.client.action.open.versions.description');
  }

  isExecutable(item: DmsObject) {
    // const oneVersion = item.version > 1;
    // return observableOf(this.isAllowedState() && oneVersion);
    return of(this.actionService.isExecutableSync('yuv-open-versions-action', item));
  }

  getParams(selection: DmsObject[]) {
    const item = selection[0];
    return { version: item.version };
  }

  getLink(selection: DmsObject[]) {
    const item = selection[0];
    return `/versions/${item.id}`;
  }

  // isAllowedState() {
  //   const disabledStates = ['/versions'];
  //   return !disabledStates.some((s) => this.router.url.startsWith(s));
  // }
}
