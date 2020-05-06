import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DmsObject } from '@yuuvis/core';
import { fromEvent, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { folder, noFile, undock } from '../../svg.generated';
import { ContentPreviewService } from './service/content-preview.service';

/**
 * Component rendering a content preview for a dms object.
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
export class ContentPreviewComponent implements OnInit, OnDestroy, AfterViewInit {
  private _dmsObject: DmsObject;
  isUndocked: boolean;

  get undockWin(): Window {
    return ContentPreviewService.getUndockWin();
  }

  previewSrc: string;

  /**
   * DmsObject to show the preview for.
   */
  @Input()
  set dmsObject(object: DmsObject) {
    // generate preview URI with streamID to enable refresh if file was changed
    !object || !object.content || !object.content.size
      ? this.contentPreviewService.resetSource()
      : this.contentPreviewService.createPreviewUrl(
          object.id,
          object.content,
          object.version,
          this.dmsObject2 && this.dmsObject2.content,
          this.dmsObject2 && this.dmsObject2.version
        );
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

  get iframe() {
    return this.elRef.nativeElement.querySelector('iframe');
  }

  @Input() dmsObject2: DmsObject;

  /**
   * `DmsObject[]` to compare changes between objects
   */
  @Input() set compareObjects(dmsObjects: DmsObject[]) {
    this.dmsObject2 = dmsObjects[1];
    this.dmsObject = dmsObjects[0];
  }

  previewSrc$: Observable<string> = this.contentPreviewService.previewSrc$;

  constructor(
    private elRef: ElementRef,
    private contentPreviewService: ContentPreviewService,
    private iconRegistry: IconRegistryService,
    private _ngZone: NgZone
  ) {
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
      this._ngZone.runOutsideAngular(_ => {
        const interval = setInterval(() => {
          if (this.undockWin && !ContentPreviewService.undockWinActive()) {
            clearInterval(interval);
            this._ngZone.run(() => this.isUndocked && this.undock());
          }
        }, 1000);
        fromEvent(window, 'beforeunload')
          .pipe(takeWhile(() => this.isUndocked))
          .subscribe(e => ContentPreviewService.closeWin());
      });
    }
    if (open) {
      this.open(this.previewSrc);
    }
  }

  open(src: string) {
    this.previewSrc = src;
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
  }

  refresh() {
    return this.previewSrc && this.iframe ? this.iframe.contentWindow.location.reload(true) : this.open(this.previewSrc);
  }

  /**
   * Custom search inside PDF.JS based on search term
   * @param term search term
   * @param pdfjs iframe element
   */
  private searchPDF(term = '', pdfjs: any) {
    // remove all special characters
    term = (term || '').replace(/[\"|\*]/g, '').trim();
    if (term && pdfjs && pdfjs.contentWindow && pdfjs.contentWindow.PDFViewerApplication && pdfjs.contentWindow.PDFViewerApplication.findController) {
      // pdfjs.contentWindow.PDFViewerApplication.findController.executeCommand('find', {
      //   caseSensitive: false,
      //   findPrevious: undefined,
      //   highlightAll: true,
      //   phraseSearch: true,
      //   query: term
      // });
      pdfjs.contentWindow.PDFViewerApplication.appConfig.findBar.findField.value = term;
      pdfjs.contentWindow.PDFViewerApplication.appConfig.findBar.highlightAllCheckbox.checked = true;
      pdfjs.contentWindow.PDFViewerApplication.appConfig.findBar.caseSensitiveCheckbox.checked = false;
    }
  }

  ngOnInit() {
    this.previewSrc$.pipe(takeUntilDestroy(this)).subscribe(src => this.open(src));
  }

  ngAfterViewInit() {
    const iframe = this.iframe;
    if (iframe) {
      fromEvent(iframe, 'load')
        .pipe(takeUntilDestroy(this))
        .subscribe(res => {
          setTimeout(() => this.searchPDF(this.searchTerm, iframe), 100);
        });
    }
  }

  ngOnDestroy() {
    // return ContentPreviewService.undockWinActive() && this.openWindow('', true);
  }
}
