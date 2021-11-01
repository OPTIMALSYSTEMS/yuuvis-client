import { ElementRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntilDestroy } from 'take-until-destroy';
import { PluginsService } from './plugins.service';

export abstract class IFrameComponent {
  loading = true;

  get iframe() {
    return this.elRef.nativeElement.querySelector('iframe');
  }

  constructor(public elRef: ElementRef, public pluginsService: PluginsService) {}

  /**
   * Custom search inside PDF.JS based on search term
   * @param term search term
   * @param win iframe window
   */
  private searchPDF(term = '', win: any) {
    // remove all special characters
    term = (term || '').replace(/[\"|\*]/g, '').trim();
    if (term && win?.PDFViewerApplication?.appConfig?.findBar) {
      // win.PDFViewerApplication.findController.executeCommand('find', {
      //   caseSensitive: false,
      //   findPrevious: undefined,
      //   highlightAll: true,
      //   phraseSearch: true,
      //   query: term
      // });
      win.PDFViewerApplication.appConfig.findBar.findField.value = term;
      win.PDFViewerApplication.appConfig.findBar.highlightAllCheckbox.checked = true;
      win.PDFViewerApplication.appConfig.findBar.caseSensitiveCheckbox.checked = false;
    }
  }

  private preventDropEvent(win: any) {
    if (this.iframe?.src?.startsWith(window.location.origin)) {
      win?.document?.addEventListener('drop', (e) => e.stopPropagation());
      // dispach drag & drop events to main window
      win?.document?.addEventListener('dragenter', (e) => {
        window.document.dispatchEvent(new DragEvent('dragenter', e));
        setTimeout(() => window.document.dispatchEvent(new DragEvent('dragleave', e)), 10);
      });
    }
  }

  iframeInit(iframe = this.iframe, searchTerm = '', onload?: Function) {
    if (iframe) {
      iframe._init ||
        fromEvent(iframe, 'load')
          .pipe(takeUntilDestroy(this))
          .subscribe(() => {
            const win = this.setApi(iframe);
            onload && onload();
            setTimeout(() => {
              this.loading = false;
              this.searchPDF(searchTerm, win);
              this.preventDropEvent(win);
            }, 100);
          });
      iframe._init = !!this.setApi(iframe);
    }
  }

  private setApi(iframe: any) {
    // set api to iframe window
    const win = iframe?.contentWindow || iframe;
    win['api'] = window['api'];
    return win;
  }
}
