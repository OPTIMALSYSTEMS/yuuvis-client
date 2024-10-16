import { Component, DestroyRef, ElementRef, Input, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommandPaletteService } from '@yuuvis/command-palette';
import { DmsObject, TranslateService, UploadService } from '@yuuvis/core';
import { Observable, fromEvent, of } from 'rxjs';
import { map, switchMap, takeWhile, tap } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { FileDropService } from '../../directives/file-drop/file-drop.service';
import { IFrameComponent } from '../../plugins/iframe.component';
import { PluginsService } from '../../plugins/plugins.service';
import { ComponentStateService } from '../../services/component-state/component-state.service';
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
  destroyRef = inject(DestroyRef);

  private CMP_KEY = 'yuv-content-preview.cmp.undock';

  private _dmsObject: DmsObject;
  isUndocked: boolean;
  componentStateId: string;

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
    const exclude = (params: any) =>
      this.activeVersion &&
      this.activeVersion?.content?.digest !== params?.digest &&
      params?.mimeType?.match(/application\/(msword|vnd.ms-excel|vnd.ms-powerpoint|vnd.openxmlformats)/) &&
      params?.viewer?.startsWith('api/pdf');

    this._dmsObject = object;
    this.loading = true;
    // generate preview URI with streamID to enable refresh if file was changed
    this.contentPreviewService.createPreviewUrl(this.dmsObject, this.dmsObject2, (o: DmsObject) => exclude(o));
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

  contentPlugins: Observable<any[]>;

  constructor(
    elRef: ElementRef,
    pluginsService: PluginsService,
    public fileDropService: FileDropService,
    private translate: TranslateService,
    private componentStateService: ComponentStateService,
    private contentPreviewService: ContentPreviewService,
    private cmpService: CommandPaletteService,
    private iconRegistry: IconRegistryService,
    private uploadService: UploadService,
    private _ngZone: NgZone
  ) {
    super(elRef, pluginsService);
    this.iconRegistry.registerIcons([folder, noFile, undock]);
    if (ContentPreviewService.undockWinActive()) {
      this.undock(false);
    }
    this.contentPlugins = this.contentPreviewService.getContentPlugins();
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
    this.loading = false;
    this.previewSrc = src && this.contentPreviewService.validateUrl(src);
    const sameOrigin = src?.startsWith(location.origin);
    if (this.isUndocked) {
      ContentPreviewService.undockWin(this.previewSrc);
      sameOrigin && this.iframeInit(this.undockWin, this.searchTerm, () => this.contentPreviewService.validateUrl(this.previewSrc));
    } else if (!this.iframe && sameOrigin) {
      // init iframe again in case it was destoryed
      setTimeout(() => this.iframeInit(this.iframe, this.searchTerm, () => this.contentPreviewService.validateUrl(this.previewSrc)));
    }
  }

  ngOnInit() {
    this.previewSrc$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((src) => this.open(src))
      )
      .subscribe();
    this.componentStateId = this.componentStateService.addComponentState('ContentPreviewComponent', {
      actions: [
        {
          label: this.translate.instant('yuv.framework.object-details.tooltip.dock'),
          callback: () => {
            this.undock();
          }
        }
      ]
    });
  }

  ngOnDestroy() {
    this.componentStateService.removeComponentState(this.componentStateId);
    this.cmpService.unregisterCommand(this.CMP_KEY);
  }
}
