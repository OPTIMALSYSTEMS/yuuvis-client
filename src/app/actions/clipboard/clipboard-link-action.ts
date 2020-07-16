import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { DmsObject, SecondaryObjectTypeField, TranslateService } from '@yuuvis/core';
import { DmsObjectTarget, NotificationService, SelectionRange, SimpleAction } from '@yuuvis/framework';
import { of as observableOf, of } from 'rxjs';

@Component({
  selector: 'yuv-clipboard-link-action',
  template: ``
})
export class ClipboardLinkActionComponent extends DmsObjectTarget implements SimpleAction {
  label: string;
  description: string;
  priority = 1;
  group = 'common';
  range = SelectionRange.MULTI_SELECT;
  static isSubAction = true;

  constructor(private translate: TranslateService, private toast: NotificationService, private location: Location) {
    super();
    this.label = this.translate.instant('yuv.client.action.clipboard.link.label');
    this.description = this.translate.instant('yuv.client.action.clipboard.link.description');
  }

  isExecutable(item: DmsObject) {
    return observableOf(true);
  }

  run(selection: DmsObject[]) {
    let urlPrefix = window.location.href.replace(this.location.path(true), '');
    let clipboardText = '';

    selection.forEach((element) => {
      const title = `${element.data[SecondaryObjectTypeField.TITLE]}`;
      if (window.location.href.includes('/versions')) {
        clipboardText += `${title}: ${urlPrefix}/versions/${element.id}&version=${element.version}\n`;
      } else {
        clipboardText += `${title}: ${urlPrefix}/object/${element.id}\n`;
      }
    });

    // Copy to clipboard via invisible textarea
    let textArea = document.createElement('textarea');
    textArea.value = clipboardText;
    document.body.appendChild(textArea);
    textArea.select();
    let copySuccess = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (copySuccess) {
      this.toast.success(this.translate.instant('yuv.client.action.clipboard.link.successful'));
    } else {
      this.toast.error(this.translate.instant('yuv.client.action.clipboard.link.error'));
    }
    return of(copySuccess);
  }
}
