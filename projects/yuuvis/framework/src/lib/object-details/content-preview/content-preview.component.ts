import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DmsObject } from '@yuuvis/core';
import { fromEvent } from 'rxjs';
import { ContentPreviewService } from '../../services/content-preview/content-preview.service';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-content-preview',
  templateUrl: './content-preview.component.html',
  styleUrls: ['./content-preview.component.scss']
})
export class ContentPreviewComponent implements AfterViewInit {
  private _dmsObject: DmsObject;

  @Input()
  set dmsObject(object: DmsObject) {
    // genberate preview URI
    if (!object) {
      this.previewSrc = null;
    } else if (!this._dmsObject || object.id !== this._dmsObject.id) {
      if (object.content) {
        this.previewSrc = this.contentPreviewService.createPreviewUrl(object.id, object.content.mimeType);
      } else {
        this.previewSrc = null;
      }
    }
    this._dmsObject = object;
  }

  get dmsObject() {
    return this._dmsObject;
  }

  icons = SVGIcons;
  previewSrc: SafeResourceUrl;

  constructor(private elRef: ElementRef, private contentPreviewService: ContentPreviewService) {}

  refresh() {
    if (this.previewSrc) {
      this.elRef.nativeElement.querySelector('iframe').contentWindow.location.reload(true);
    }
  }

  ngAfterViewInit() {
    const iframe = this.elRef.nativeElement.querySelector('iframe');
    console.log(iframe);

    fromEvent(iframe, 'load').subscribe(res => {
      try {
        console.log('DONE....');
        window['iframe'] = iframe;
        const styles = document.createElement('link');
        styles.setAttribute('href', 'http://localhost:4400/assets/default/theme/theme.css');
        styles.setAttribute('rel', 'stylesheet');
        // styles.innerText = 'body { background: hotpink;}';

        iframe.contentDocument.head.appendChild(styles);
        iframe.contentDocument.body.appendChild(styles);
        console.log(iframe.contentDocument.head);
      } catch (error) {
        console.log(error);
      }
    });
  }
}
