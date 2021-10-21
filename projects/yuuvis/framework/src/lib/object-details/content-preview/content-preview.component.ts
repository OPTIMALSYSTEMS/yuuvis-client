import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DmsObject, UploadService } from '@yuuvis/core';
import { fromEvent, Observable, of } from 'rxjs';
import { switchMap, takeWhile, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { FileDropService } from '../../directives/file-drop/file-drop.service';
import { IFrameComponent } from '../../plugins/iframe.component';
import { PluginsService } from '../../plugins/plugins.service';
import { folder, noFile, undock } from '../../svg.generated';
import { ContentPreviewService } from './service/content-preview.service';

/**
 * Component rendering a content preview for a dms object.
 *
 * [Screenshot](../assets/images/yuv-content-preview.gif)
 *
 * @example
 * <yuv-content-preview [dmsObject]="dmsObject"></yuv-content-preview>
 */
@Component({
  selector: 'yuv-content-preview',
  templateUrl: './content-preview.component.html',
  styleUrls: ['./content-preview.component.scss'],
  providers: [ContentPreviewService]
})
export class ContentPreviewComponent extends IFrameComponent implements OnInit, OnDestroy {
  private _dmsObject: DmsObject;
  isUndocked: boolean;

  get undockWin(): Window {
    return ContentPreviewService.getUndockWin();
  }

  previewSrc: string;

  @Input() activeVersion: DmsObject;

  /**
   * DmsObject to show the preview for.
   */
  @Input()
  set dmsObject(object: DmsObject) {
    // exclude old (non existent) office documents renditions
    const getContent = (o) =>
      this.activeVersion &&
      this.activeVersion?.content?.contentStreamId !== o?.content?.contentStreamId &&
      o?.content?.mimeType?.match(/application\/(msword|vnd.ms-excel|vnd.ms-powerpoint|vnd.openxmlformats)/)
        ? null
        : o?.content;
    // generate preview URI with streamID to enable refresh if file was changed
    !getContent(object)?.size && !this.dmsObject2
      ? this.contentPreviewService.resetSource()
      : this.contentPreviewService.createPreviewUrl(object.id, getContent(object), object.version, getContent(this.dmsObject2), this.dmsObject2?.version);
    this.loading = !getContent(object) || this.dmsObject ? false : true;
    this._dmsObject = object;
  }

  get dmsObject() {
    return this._dmsObject;
  }

  /**
   * If you provide a search term here, the component will
   * try to highlight this term within the preview. Depending on the
   * type of viewer rendering the objects content, this may be supported or not.
   */
  @Input() searchTerm = '';

  @Input() dmsObject2: DmsObject;

  /**
   * `DmsObject[]` to compare changes between objects
   */
  @Input() set compareObjects(dmsObjects: DmsObject[]) {
    this.dmsObject2 = dmsObjects[1]; // previewSrc requires dmsObject2 - should be set before dmsObject
    this.dmsObject = dmsObjects[0];
  }

  previewSrc$: Observable<string> = this.uploadService.uploadStatus$.pipe(
    tap((status) => (this.loading = typeof status === 'boolean' && !status ? true : false)),
    switchMap((status) => (typeof status === 'boolean' && !status ? of(null) : this.contentPreviewService.previewSrc$))
  );

  constructor(
    elRef: ElementRef,
    pluginsService: PluginsService,
    public fileDropService: FileDropService,
    private contentPreviewService: ContentPreviewService,
    private iconRegistry: IconRegistryService,
    private uploadService: UploadService,
    private _ngZone: NgZone
  ) {
    super(elRef, pluginsService);
    this.iconRegistry.registerIcons([folder, noFile, undock]);
    if (ContentPreviewService.undockWinActive()) {
      this.undock(false);
    }
  }

  undock(open = true) {
    this.isUndocked = !this.isUndocked;
    if (!this.isUndocked) {
      ContentPreviewService.closeWin();
    } else {
      this._ngZone.runOutsideAngular((_) => {
        const interval = setInterval(() => {
          if (this.undockWin && !ContentPreviewService.undockWinActive()) {
            clearInterval(interval);
            this._ngZone.run(() => this.isUndocked && this.undock());
          }
        }, 1000);
        fromEvent(window, 'beforeunload')
          .pipe(takeWhile(() => this.isUndocked))
          .subscribe((e) => ContentPreviewService.closeWin());
      });
    }
    if (open) {
      this.open(this.previewSrc);
    }
  }

  open(src: string) {
    if (!this.iframe) {
      // init iframe again in case it was destoryed
      setTimeout(() => this.iframeInit(this.iframe, this.searchTerm, () => this.contentPreviewService.validateUrl(this.previewSrc)));
    }
    this.previewSrc = this.contentPreviewService.validateUrl(src);
    if (this.isUndocked) {
      this.openWindow(this.previewSrc);
    }
  }

  openWindow(src: string, clean = false) {
    ContentPreviewService.undockWin(src);
    if (clean) {
      while (this.undockWin.document.body.firstChild) {
        this.undockWin.document.body.firstChild.remove();
      }
    } else if (!src && !this.undockWin.document.querySelector('#no-file')) {
      this.undockWin.document.write(
        `<div id="no-file" style="opacity: 0.1; display: flex; height: 100%; width: 100%; align-items: center; justify-content: center;"> 
         ${noFile.data.replace(/"48"/g, '"100"')}
        <div>`
      );
    }
    this.iframeInit(this.undockWin, this.searchTerm);
  }

  refresh() {
    return this.previewSrc && this.iframe ? this.iframe.contentWindow.location.reload(true) : this.open(this.previewSrc);
  }

  ngOnInit() {
    this.previewSrc$.pipe(takeUntilDestroy(this)).subscribe((src) => this.open(src));
  }

  ngOnDestroy() {
    // return ContentPreviewService.undockWinActive() && this.openWindow('', true);
  }
}
