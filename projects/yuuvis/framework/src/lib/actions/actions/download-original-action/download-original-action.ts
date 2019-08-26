
import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService, DmsObject, TranslateService } from '@yuuvis/core';
import * as FileSaver from 'file-saver';
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
    const isVersionState = this.router.url.startsWith('/versions');
    // this.backend.downloadContent(selection, null, isVersionState);
    this.downloadContent(selection);
    return of(true);
  }

  /**
   * Download the content of dms objects.
   *
   * @param DmsObject[] dmsObjects Array of dms objects to be downloaded
   * @param "PDF" | "TIFF" | "TEXT" | "JPEG" rendition The type of rendition to be downloaded. If not specified, the original content will be downloaded.
   * Possible renditions are `PDF`, `TIFF`, `TEXT`, `JPEG`.
   */
  private downloadContent(dmsObjects: DmsObject[], rendition?: 'PDF' | 'TIFF' | 'TEXT' | 'JPEG', fileNameWithVersionNumber?: boolean) {

    dmsObjects.forEach(dmsObject => {
      // if (dmsObject.content) {
      if (true) {

        // let uri = `${this.getServiceBase()}/dms/${dmsObject.content.id}/content?type=${dmsObject.content.type}&asdownload=true`;
        let uri = `/api/dms/objects/${dmsObject.id}/contents/file`;
        // if (rendition) {
        //   uri += `&rendition=${rendition}&_intent=DOWNLOAD_${rendition}`;
        // } else {
        //   uri += '&intent=DOWNLOAD';
        // }
        // if (dmsObject.content.id === dmsObject.id) {
        //   uri += `&version=${dmsObject.version}`;
        // }
        this.download(uri, fileNameWithVersionNumber ? dmsObject.version : null);
      } else {
        // this.logger.error('The provided dms object has no content', dmsObject);
      }
    });
  }

  private download(uri: string, version?: number) {
    this.backend.get(uri, null, { observe: 'response', responseType: 'blob' })
      .subscribe((res) => {
        FileSaver.saveAs(
          res.body,
          this.getFileNameFromHttpResponse(res, version)
        );
      });
  }

  private getFileNameFromHttpResponse(res: HttpResponse<any>, version: number) {
    const contentDispositionHeader = res.headers.get('Content-Disposition') || '';
    const filename = (contentDispositionHeader.match('filename=\"(.*)\"') || [, 'unknown'])[1];
    const index = !~filename.lastIndexOf('.') ? filename.length : filename.lastIndexOf('.');
    return !version ? filename : `${filename.slice(0, index)}_v${version}${filename.slice(index)}`;
  }
}
