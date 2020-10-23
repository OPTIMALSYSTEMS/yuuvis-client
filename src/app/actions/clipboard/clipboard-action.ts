import { Component } from '@angular/core';
import { DmsObject, TranslateService } from '@yuuvis/core';
import { clipboard, DmsObjectTarget, ListAction, SelectionRange } from '@yuuvis/framework';
import { of } from 'rxjs';
import { ClipboardLinkActionComponent } from './clipboard-link-action';

@Component({
  selector: 'yuv-clipboard-action',
  template: ``
})
export class ClipboardActionComponent extends DmsObjectTarget implements ListAction {
  header: string;
  label: string;
  description: string;
  priority = 11;
  iconSrc = clipboard.data;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;
  subActionComponents: any[];

  constructor(private translate: TranslateService) {
    super();
    this.label = this.translate.instant('yuv.client.action.clipboard.label');
    this.description = this.translate.instant('yuv.client.action.clipboard.description');
    this.header = this.label;
    this.subActionComponents = [ClipboardLinkActionComponent];
  }

  isExecutable(element: DmsObject) {
    return of(true);
  }
}
