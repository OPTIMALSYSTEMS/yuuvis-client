import { PlatformLocation } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ApiBase, DmsObject } from '@yuuvis/core';
import { fromEvent } from 'rxjs';
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
        const mimeType = encodeURIComponent(object.content.mimeType);
        const path = encodeURIComponent(`${ApiBase.apiWeb}/dms/${object.id}/content`);
        this.previewSrc = `${this.location.protocol}//${this.location.hostname}:${this.location.port}/preview?mimeType=${mimeType}&path=${path}`;
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

  constructor(private elRef: ElementRef, private location: PlatformLocation) {}

  refresh() {
    if (this.previewSrc) {
      this.elRef.nativeElement.querySelector('iframe').contentWindow.location.reload(true);
    }
  }

  randomSource() {
    const urls = [
      'http://localhost:9000/preview?mimeType=application%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest.json',
      'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest.eml',
      'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_attachment.eml',
      'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_pdf_mail.eml',
      'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_multi_upload.eml',
      'http://localhost:9000/preview?mimeType=text%2Fmarkdown&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest.md',
      'http://localhost:9000/preview?mimeType=application%2Fpdf&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest.pdf',
      'http://localhost:9000/preview?mimeType=video%2Fmp4&path=%2F%2Fvjs.zencdn.net%2Fv%2Foceans.mp4',
      'http://localhost:9000/preview?mimeType=audio%2Fmp3&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Fsample.mp3',
      'http://localhost:9000/preview?mimeType=image%2Fmp4&path=http%3A%2F%2Finterfacelift.com%2Fwallpaper%2Fpreviews%2F03818_posinghummingbird_672x420.jpg',
      'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_multi_.eml',
      'http://localhost:9000/preview?mimeType=blaaaaa&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_multi_.eml'
    ];

    return urls[Math.floor(Math.random() * urls.length)];
  }

  ngAfterViewInit() {
    const iframe = this.elRef.nativeElement.querySelector('iframe');
    console.log(iframe);

    fromEvent(iframe, 'load').subscribe(res => {
      try {
        console.log(iframe.contentWindow.location.href);
      } catch (error) {
        console.log(error);
      }
    });
  }
}
