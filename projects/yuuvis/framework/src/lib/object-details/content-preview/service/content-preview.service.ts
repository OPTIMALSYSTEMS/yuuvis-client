import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';
import { BackendService, DmsObjectContent, DmsService, UserService, Utils } from '@yuuvis/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PluginsService, UNDOCK_WINDOW_NAME } from '../../../plugins/plugins.service';
import { LayoutService } from '../../../services/layout/layout.service';

/**
 * @ignore
 * Providing a content preview for a dms object.
 */
@Injectable()
export class ContentPreviewService {
  private previewSrcSource = new ReplaySubject<string>(null);
  public previewSrc$: Observable<string> = this.previewSrcSource.asObservable();

  static undockWin(src: string) {
    return (window[UNDOCK_WINDOW_NAME] = window.open(
      src || '',
      UNDOCK_WINDOW_NAME,
      'directories=0, titlebar=0, toolbar=0, location=0, status=0, menubar=0, resizable=1, top=10, left=10'
    ));
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
  constructor(
    private location: PlatformLocation,
    private dmsService: DmsService,
    private userService: UserService,
    private backend: BackendService,
    private layoutService: LayoutService,
    private pluginsService: PluginsService
  ) {}

  private createPath(id: string, version?: number): { root: string; path: string; pathPdf: string } {
    let root;
    if (this.backend.authUsesOpenIdConnect()) {
      root = this.backend.oidc.host;
    } else {
      root = `${this.location.protocol}//${this.location.hostname}`;
      if (this.location.port.length) {
        root += `:${this.location.port}`;
      }
    }
    const path = `${this.backend.authUsesOpenIdConnect() ? '' : root}${this.dmsService.getContentPath(id)}?asdownload=false${
      version ? '&version=' + version : ''
    }`;
    const pathPdf = `${root}/api/dms/objects/${id}${version ? '/versions/' + version : ''}/contents/renditions/pdf`;
    return { root, path, pathPdf };
  }

  private createSettings() {
    const { darkMode, accentColor } = this.layoutService.getLayoutSettings();
    const user = this.userService.getCurrentUser();
    const direction = user.uiDirection;
    const lang = this.mapLang(user.getClientLocale());
    return { darkMode, accentColor, direction, lang };
  }

  private createParams(objectId: string, content: DmsObjectContent, version?: number) {
    const { mimeType, size, contentStreamId, fileName } = content;
    const { root, path, pathPdf } = this.createPath(objectId, version);
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
    return { mimeType, path, pathPdf, fileName, fileExtension, size, contentStreamId, objectId, root, ...this.createSettings() };
  }

  private resolveCustomViewerConfig(params: any[]) {
    return this.pluginsService.getCustomPlugins('viewers').pipe(
      map((viewers) =>
        params.forEach((param) => {
          const { mimeType, fileExtension } = param;
          // shared code from heimdall
          const config = viewers?.find((c: any) => {
            const matchMT = (typeof c.mimeType === 'string' ? [c.mimeType] : c.mimeType).includes(mimeType);
            const matchFE = c.fileExtension
              ? (typeof c.fileExtension === 'string' ? [c.fileExtension] : c.fileExtension).includes((fileExtension || '').toLowerCase())
              : true;
            return matchMT && matchFE;
          });

          param.viewer = config?.viewer || undefined;
        })
      )
    );
  }

  createPreviewUrl(id: string, content: DmsObjectContent, version?: number, content2?: DmsObjectContent, version2?: number): void {
    const params = this.createParams(id, content, version);
    const query: any = content2 ? { compare: [params, this.createParams(id, content2, version2)] } : params;
    this.resolveCustomViewerConfig(query.compare || [query]).subscribe(() => {
      this.previewSrcSource.next(id ? Utils.buildUri(`${params.root}/viewer/`, query) : '');
    });
  }

  resetSource() {
    this.previewSrcSource.next();
  }

  mapLang(lang: string) {
    switch (lang) {
      case 'en':
        return 'en-US';
      case 'es':
        return 'es-ES';
      case 'pt':
        return 'pt-PT';
      case 'zh':
        return 'zh-CN';
      case 'hi':
        return 'hi-IN';
      case 'bn':
        return 'bn-BD';
      default:
        return lang;
    }
  }
}
