import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';
import { ApiBase, DmsObjectContent, UserService, Utils } from '@yuuvis/core';
import { Observable, ReplaySubject } from 'rxjs';
import { LayoutService } from '../../../services/layout/layout.service';

@Injectable()
export class ContentPreviewService {
  static UNDOCK_WINDOW_NAME = 'eoViewer';

  private previewSrcSource = new ReplaySubject<string>(null);
  public previewSrc$: Observable<string> = this.previewSrcSource.asObservable();

  static undockWin(src: string) {
    return (window[ContentPreviewService.UNDOCK_WINDOW_NAME] = window.open(
      src || '',
      ContentPreviewService.UNDOCK_WINDOW_NAME,
      'directories=0, titlebar=0, toolbar=0, location=0, status=0, menubar=0, resizable=1, top=10, left=10'
    ));
  }

  static closeWin() {
    return this.getUndockWin() && this.getUndockWin().close();
  }

  static getUndockWin(): Window {
    return window[ContentPreviewService.UNDOCK_WINDOW_NAME];
  }

  static undockWinActive(): boolean {
    return !!ContentPreviewService.getUndockWin() && !ContentPreviewService.getUndockWin().closed;
  }

  constructor(private location: PlatformLocation, private userService: UserService, private layoutService: LayoutService) {}

  private createPath(id: string, version?: number): { root: string; path: string } {
    let root = `${this.location.protocol}//${this.location.hostname}`;
    root = this.location.port.length ? `${root}:${this.location.port}` : root;
    const path = `${root}/${ApiBase.apiWeb}/dms/${id}/content?asdownload=false${version ? '&version=' + version : ''}`;
    return { root, path };
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
    const { root, path } = this.createPath(objectId, version);
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
    return { mimeType, path, fileExtension, size, contentStreamId, objectId, root, ...this.createSettings() };
  }

  createPreviewUrl(id: string, content: DmsObjectContent, version?: number, content2?: DmsObjectContent, version2?: number): void {
    console.log({ content });

    const params = this.createParams(id, content, version);
    const query = content2 ? { compare: [params, this.createParams(id, content2, version2)] } : params;
    this.previewSrcSource.next(id ? Utils.buildUri(`${params.root}/viewer/`, query) : '');
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
