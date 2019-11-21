import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';
import { ApiBase, DmsObjectContent, UserService, Utils } from '@yuuvis/core';
import { LayoutService } from '../../../services/layout/layout.service';

@Injectable({
  providedIn: 'root'
})
export class ContentPreviewService {
  constructor(private location: PlatformLocation, private userService: UserService, private layoutService: LayoutService) {}

  createPreviewUrl(id: string, content: DmsObjectContent): string {
    const { mimeType, size, contentStreamId, fileName } = content;
    const { root, path } = this.createPath(id);
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
    return id ? Utils.buildUri(`${root}/viewer/`, { mimeType, path, fileExtension, size, contentStreamId, ...this.createSettings() }) : '';
  }

  private createPath(id: string): { root: string; path: string } {
    let root = `${this.location.protocol}//${this.location.hostname}`;
    root = this.location.port.length ? `${root}:${this.location.port}` : root;
    const path = `${root}/${ApiBase.apiWeb}/dms/${id}/content?asdownload=false`;
    return { root, path };
  }

  private createSettings() {
    const { darkMode, accentColor } = this.layoutService.getLayoutSettings();
    const user = this.userService.getCurrentUser();
    const direction = user.uiDirection;
    const lang = this.mapLang(user.getClientLocale());
    return { darkMode, accentColor, direction, lang };
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
