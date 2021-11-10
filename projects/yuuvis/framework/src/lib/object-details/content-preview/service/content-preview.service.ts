import { Injectable } from '@angular/core';
import { BackendService, DmsObject, DmsService } from '@yuuvis/core';
import { Observable, ReplaySubject } from 'rxjs';
import { PluginsService, UNDOCK_WINDOW_NAME } from '../../../plugins/plugins.service';

/**
 * @ignore
 * Providing a content preview for a dms object.
 */
@Injectable()
export class ContentPreviewService {
  private previewSrcSource = new ReplaySubject<string>(null);
  public previewSrc$: Observable<string> = this.previewSrcSource.asObservable();

  static undockWin(src: string) {
    const w = (window[UNDOCK_WINDOW_NAME] = window.open(
      src || '',
      UNDOCK_WINDOW_NAME,
      'directories=0, titlebar=0, toolbar=0, location=0, status=0, menubar=0, resizable=1, top=10, left=10'
    ));
    return w;
  }

  static closeWin() {
    this.getUndockWin() && this.getUndockWin().close();
    delete window[UNDOCK_WINDOW_NAME];
  }

  static getUndockWin(): Window {
    return window[UNDOCK_WINDOW_NAME];
  }

  static undockWinActive(): boolean {
    return !!ContentPreviewService.getUndockWin() && !ContentPreviewService.getUndockWin().closed;
  }

  /**
   *
   * @ignore
   */
  constructor(private dmsService: DmsService, private backend: BackendService, private pluginsService: PluginsService) {
    this.pluginsService.api.content.catchError().subscribe((evt: any) => {
      const { err, win, parameters } = evt.data;
      const params = this.pluginsService.resolveViewerParams({ path: parameters.path }, err);
      win.location.href = params.uri;
    });
  }

  validateUrl(src: string) {
    if (src && this.backend.authUsesOpenIdConnect()) {
      const newsrc = this.pluginsService.validateUrl(src);
      newsrc !== src && this.previewSrcSource.next(src);
      return newsrc;
    }
    return src;
  }

  private createParams(dmsObject: DmsObject) {
    const { mimeType, size, digest, fileName } = dmsObject?.content || {};
    const fileExtension = fileName?.includes('.') ? fileName.split('.').pop() : '';
    const id = dmsObject?.id;
    const version = dmsObject?.version;
    const path = size ? this.dmsService.getFullContentPath(id, version) : '';
    const pathPdf = size ? this.dmsService.getFullContentPath(id, version, true) : '';
    return { mimeType, size, digest, fileName, fileExtension, id, version, path, pathPdf };
  }

  private resolveCustomViewerConfig(dmsObject: DmsObject, exclude: Function) {
    const params: any = this.pluginsService.resolveViewerParams(this.createParams(dmsObject), dmsObject);
    return exclude && exclude(dmsObject) ? this.pluginsService.resolveViewerParams({ path: params.path }, dmsObject) : params;
  }

  createPreviewUrl(dmsObject: DmsObject, dmsObject2?: DmsObject, exclude?: Function): void {
    this.pluginsService.getCustomPlugins('viewers').subscribe(() => {
      const params = [this.resolveCustomViewerConfig(dmsObject, exclude)];
      dmsObject2?.version && params.push(this.resolveCustomViewerConfig(dmsObject2, exclude));
      this.previewSrcSource.next(this.pluginsService.resolveUri(params));
    });
  }

  resetSource() {
    this.previewSrcSource.next();
  }
}
