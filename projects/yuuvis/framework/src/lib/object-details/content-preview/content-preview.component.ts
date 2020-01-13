import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { DmsObject } from '@yuuvis/core';
import { fromEvent, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { folder, noFile } from '../../svg.generated';
import { ContentPreviewService } from './service/content-preview.service';

@Component({
  selector: 'yuv-content-preview',
  templateUrl: './content-preview.component.html',
  styleUrls: ['./content-preview.component.scss'],
  providers: [ContentPreviewService]
})
export class ContentPreviewComponent implements AfterViewInit {
  private _dmsObject: DmsObject;

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

  previewSrc$: Observable<string> = this.contentPreviewService.previewSrc$;

  constructor(private elRef: ElementRef, private contentPreviewService: ContentPreviewService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([folder, noFile]);
  }

  refresh() {
    this.previewSrc$.pipe(tap(val => (val ? this.elRef.nativeElement.querySelector('iframe').contentWindow.location.reload(true) : null)));
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

  ngAfterViewInit() {
    const iframe = this.elRef.nativeElement.querySelector('iframe');
    if (iframe) {
      fromEvent(iframe, 'load').subscribe(res => {
        setTimeout(() => this.searchPDF(this.searchTerm, iframe), 100);
      });
    }
  }
}
