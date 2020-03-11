import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { DmsObject } from '@yuuvis/core';
import { fromEvent, Observable } from 'rxjs';
import { takeUntilDestroy } from 'take-until-destroy';
import { folder, noFile, undock } from '../../svg.generated';
import { ContentPreviewService } from './service/content-preview.service';

@Component({
  selector: 'yuv-content-preview',
  templateUrl: './content-preview.component.html',
  styleUrls: ['./content-preview.component.scss'],
  providers: [ContentPreviewService]
})
export class ContentPreviewComponent implements OnInit, OnDestroy, AfterViewInit {
  private _dmsObject: DmsObject;
  isUndocked: boolean;
  undockWin: Window;
  previewSrc: string;

  @Input() searchTerm = '';

  @Input()
  set dmsObject(object: DmsObject) {
    // generate preview URI with streamID to enable refresh if file was changed
    !object || !object.content || !object.content.size
      ? this.contentPreviewService.resetSource()
      : this.contentPreviewService.createPreviewUrl(object.id, object.content);
    this._dmsObject = object;
  }

  get dmsObject() {
    return this._dmsObject;
  }

  get iframe() {
    return this.elRef.nativeElement.querySelector('iframe');
  }

  previewSrc$: Observable<string> = this.contentPreviewService.previewSrc$;

  constructor(
    private elRef: ElementRef,
    private contentPreviewService: ContentPreviewService,
    private iconRegistry: IconRegistryService,
    private _ngZone: NgZone
  ) {
    this.iconRegistry.registerIcons([folder, noFile, undock]);
  }

  undock() {
    this.isUndocked = !this.isUndocked;
    if (!this.isUndocked) {
      this.undockWin.close();
    } else {
      this._ngZone.runOutsideAngular(_ => {
        const interval = setInterval(() => {
          if (this.undockWin && this.undockWin.closed) {
            clearInterval(interval);
            this._ngZone.run(() => this.isUndocked && this.undock());
          }
        }, 1000);
      });
    }
    this.open(this.previewSrc);
  }

  open(src: string) {
    this.previewSrc = src;
    if (this.isUndocked) {
      this.undockWin = window.open(
        this.previewSrc || '',
        'eoViewer',
        'directories=0, titlebar=0, toolbar=0, location=0, status=0, menubar=0, resizable=1, top=10, left=10'
      );
      if (!this.previewSrc) {
        this.undockWin.document.write(
          `<div style="opacity: 0.1; display: flex; height: 100%; width: 100%; align-items: center; justify-content: center;"> 
           ${noFile.data.replace(/"48"/g, '"100"')}
          <div>`
        );
      }
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
    return this.undockWin && this.undockWin.close();
  }
}
