import { ElementRef } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent } from 'rxjs';
import { PluginsService } from './plugins.service';

export abstract class IFrameComponent {
  loading = true;

  get iframe() {
    return this.elRef.nativeElement.querySelector('iframe');
  }

  constructor(public elRef: ElementRef, public pluginsService: PluginsService) { }

  /**
   * Custom search inside PDF.JS based on search term
   * @param term search term
   * @param win iframe window
   */
  private searchPDF(term = '', win: any) {
    // remove all special characters
    term = (term || '').replace(/[\"|\*]/g, '').trim();
    if (term && win?.PDFViewerApplication?.appConfig?.findBar) {
      win.PDFViewerApplication.appConfig.findBar.findField.value = term;
      win.PDFViewerApplication.appConfig.findBar.highlightAllCheckbox.checked = true;
      win.PDFViewerApplication.appConfig.findBar.caseSensitiveCheckbox.checked = false;
      // trigger find event on pdf.js load
      // win.PDFViewerApplication.initializedPromise?.then(() => win.PDFViewerApplication.findBar.dispatchEvent());
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
        fromEvent(this.setApi(iframe, true), 'load')
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            const win = this.setApi(iframe);
            onload && onload();
            setTimeout(() => {
              this.loading = false;
              this.searchPDF(searchTerm, win);
              this.preventDropEvent(win);
            }, 100);
          });
    }
  }

  private setApi(iframe: any, init = false) {
    // set api to iframe window
    const win = iframe?.contentWindow || iframe;
    win['api'] = window['api'];
    // disable beforeunload popup (Reload site? Changes that you made may not be saved.)
    win.addEventListener('beforeunload', (event: Event) => event.stopImmediatePropagation());

    if (init) {
      iframe._init = true;
      setTimeout(() => this.setApi(iframe), 500);
      return iframe;
    }
    return win;
  }
}
