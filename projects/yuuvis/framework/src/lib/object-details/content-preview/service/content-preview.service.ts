import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';
import { ApiBase, UserService, Utils } from '@yuuvis/core';
import { LayoutService } from '../../../services';

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
    const lang = user.getClientLocale();
    return { darkMode, accentColor, direction, lang };
  }
}
