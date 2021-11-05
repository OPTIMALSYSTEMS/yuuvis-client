import { Injectable } from '@angular/core';
import { BackendService, DmsObject, DmsObjectContent, DmsService } from '@yuuvis/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PluginsService, UNDOCK_WINDOW_NAME } from '../../../plugins/plugins.service';

/**
 * @ignore
 * Providing a content preview for a dms object.
 */
@Injectable()
export class ContentPreviewService {
  private hash: string;
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
      const uri = this.pluginsService.applyFunction(this.pluginsService.customPlugins?.viewers?.find((v) => v.error)?.viewer, 'api, err, win, parameters', [
        this.pluginsService.api,
        err,
        win,
        parameters
      ]);

      uri && (win.location.href = uri);
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

  private createParams(objectId: string, content: DmsObjectContent, version?: number) {
    if (!content) return {};
    const { mimeType, size, digest, fileName } = content;
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
    const path = this.dmsService.getFullContentPath(objectId, version);
    return { mimeType, path, fileName, fileExtension, size, digest, objectId, version };
  }

  private resolveCustomViewerConfig(params: any[], dmsObjects: DmsObject[]) {
    return this.pluginsService.getCustomPlugins('viewers').pipe(
      map(() => {
        return params.map((param, i) => {
          const o = dmsObjects[i];
          const p: any = this.createParams(o?.id, o?.content, o?.version);
          const pp = this.pluginsService.resolveViewerParams(p, o);
          return param.size || !pp.viewer.startsWith('api/pdf') ? pp : {};
        });
      }),
      // switchMap((p) => (!p.find((o) => o.size) ? of(false) : this.hash ? of(true) : this.resolveHash(params)))
      switchMap((p) => (!p.find((o) => o.size) ? of(false) : of(p)))
    );
  }

  createPreviewUrl(id: string, content: DmsObjectContent, dmsObject?: DmsObject, content2?: DmsObjectContent, dmsObject2?: DmsObject): void {
    const params = this.createParams(id, content, dmsObject?.version);
    const query: any = dmsObject2?.version ? { compare: [params, this.createParams(id, content2, dmsObject2?.version)] } : params;
    this.resolveCustomViewerConfig(query.compare || [query], [dmsObject, dmsObject2]).subscribe((hasConfig) => {
      // this.previewSrcSource.next(id && hasConfig ? Utils.buildUri(`${this.getBaseUrl()}/`, { ...query, headers }) : '');
      this.previewSrcSource.next(id && hasConfig ? this.pluginsService.resolveUri(hasConfig) : '');
    });
  }

  resetSource() {
    this.previewSrcSource.next();
  }
}
