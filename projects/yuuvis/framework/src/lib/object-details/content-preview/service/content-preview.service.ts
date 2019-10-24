import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';
import { ApiBase, UserService, Utils } from '@yuuvis/core';
import { LayoutService } from '@yuuvis/framework';

@Injectable({
  providedIn: 'root'
})
export class ContentPreviewService {
  constructor(private location: PlatformLocation, private userService: UserService, private layoutService: LayoutService) {}

  createPreviewUrl(id: string, contentMimeType: string): string {
    const { root, mimeType, path } = this.createPath(id, contentMimeType);
    return Utils.buildUri(`${root}/viewer/`, { mimeType, path, ...this.createSettings() });
  }

  private createPath(id, contentMimeType): { root: string; mimeType: string; path: string } {
    let root = `${this.location.protocol}//${this.location.hostname}`;
    root = this.location.port.length ? `${root}:${this.location.port}` : root;
    const mimeType = contentMimeType;
    const path = `${root}/${ApiBase.apiWeb}/dms/${id}/content?download=false`;
    return { root, mimeType, path };
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
