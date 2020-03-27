import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';
import { ApiBase, DmsObjectContent, UserService, Utils } from '@yuuvis/core';
import { Observable, ReplaySubject } from 'rxjs';
import { LayoutService } from '../../../services/layout/layout.service';

@Injectable()
export class ContentPreviewService {
  private previewSrcSource = new ReplaySubject<string>(null);
  public previewSrc$: Observable<string> = this.previewSrcSource.asObservable();

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

  createPreviewUrl(id: string, content: DmsObjectContent, version?: number): void {
    const { mimeType, size, contentStreamId, fileName } = content;
    const { root, path } = this.createPath(id, version);
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
    this.previewSrcSource.next(id ? Utils.buildUri(`${root}/viewer/`, { mimeType, path, fileExtension, size, contentStreamId, ...this.createSettings() }) : '');
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
