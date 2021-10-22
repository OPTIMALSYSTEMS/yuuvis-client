import { Injectable } from '@angular/core';
import { ApiBase, BackendService, DmsObject, DmsObjectContent, DmsService, UserService, Utils } from '@yuuvis/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PluginsService, UNDOCK_WINDOW_NAME } from '../../../plugins/plugins.service';
import { LayoutService } from '../../../services/layout/layout.service';

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
    private dmsService: DmsService,
    private userService: UserService,
    private backend: BackendService,
    private layoutService: LayoutService,
    private pluginsService: PluginsService
  ) {}

  getBaseUrl() {
    const base = this.backend.getApiBase(ApiBase.none, true);
    const viewer = this.backend.getApiBase('viewer', true);
    // default baseUrl in case it is not specified in main.json
    return base === viewer ? base + '/viewer' : viewer;
  }

  validateUrl(src: string) {
    if (src && this.backend.authUsesOpenIdConnect()) {
      // validate/update authorization token
      const reg = new RegExp(encodeURIComponent('.*"Bearer (.*)"'));
      const token = src.match(reg)?.[1];
      if (token !== localStorage.access_token) {
        src = src.replace(new RegExp(token, 'g'), localStorage.access_token);
        this.previewSrcSource.next(src);
      }
    }
    return src;
  }

  private createPath(id: string, version?: number): { baseUrl: string; path: string } {
    const baseUrl = this.getBaseUrl();
    const path = this.dmsService.getFullContentPath(id, version);
    return { baseUrl, path };
  }

  private createSettings() {
    const { darkMode, accentColor } = this.layoutService.getLayoutSettings();
    const user = this.userService.getCurrentUser();
    const direction = user.uiDirection;
    const lang = this.mapLang(user.getClientLocale());
    const tenant = this.userService.getCurrentUser().tenant;
    return { darkMode, accentColor, direction, lang, username: user.firstname || user.username, tenant, hash: this.hash };
  }

  private createParams(objectId: string, content: DmsObjectContent, version?: number) {
    if (!content) return {};
    const { mimeType, size, contentStreamId, fileName } = content;
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
    return { mimeType, ...this.createPath(objectId, version), fileName, fileExtension, size, contentStreamId, objectId, version, ...this.createSettings() };
  }

  private resolveHash(params: any[]) {
    const uri = Utils.buildUri(`/hash`, { tenant: this.userService.getCurrentUser().tenant });
    const viewers = this.pluginsService.customPlugins.viewers || [];
    const translations = this.pluginsService.customPlugins.translations || {};
    const hasConfig = viewers?.length || JSON.stringify(translations).match('yuv.viewer.');
    return hasConfig
      ? this.backend.post(uri, { viewers, translations }, 'viewer').pipe(map((c) => !!params.map((p) => (this.hash = p.hash = c?.hash))))
      : of(true);
  }

  private resolveCustomViewerConfig(params: any[], dmsObjects: DmsObject[]) {
    return this.pluginsService.getCustomPlugins('viewers').pipe(
      map((viewers) =>
        params.map((param, i) => {
          const o = dmsObjects[i];
          const p: any = this.createParams(o?.id, o?.content, o?.version);
          const { mimeType, fileExtension } = p;
          // shared code from heimdall
          const config = viewers?.find((c: any) => {
            const matchMT = (typeof c.mimeType === 'string' ? [c.mimeType] : c.mimeType).includes(mimeType);
            const matchFE = c.fileExtension
              ? (typeof c.fileExtension === 'string' ? [c.fileExtension] : c.fileExtension).includes((fileExtension || '').toLowerCase())
              : true;
            return matchMT && matchFE;
          });

          param.viewer = this.pluginsService.applyFunction(config?.viewer, 'api, dmsObject, parameters, createParams', [
            this.pluginsService.api,
            o,
            param,
            () => Object.assign(param, p)
          ]);

          return param;
        })
      ),
      switchMap((p) => (!p.find((o) => o.size) ? of(false) : this.hash ? of(true) : this.resolveHash(params)))
    );
  }

  createPreviewUrl(id: string, content: DmsObjectContent, dmsObject?: DmsObject, content2?: DmsObjectContent, dmsObject2?: DmsObject): void {
    const params = this.createParams(id, content, dmsObject?.version);
    const headers = this.backend.authUsesOpenIdConnect() ? JSON.stringify(this.backend.getAuthHeaders()) : undefined;
    const query: any = dmsObject2?.version ? { compare: [params, this.createParams(id, content2, dmsObject2?.version)] } : params;
    this.resolveCustomViewerConfig(query.compare || [query], [dmsObject, dmsObject2]).subscribe((hasConfig) => {
      this.previewSrcSource.next(id && hasConfig ? Utils.buildUri(`${this.getBaseUrl()}/`, { ...query, headers }) : '');
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
