import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DmsObject } from '@yuuvis/core';
import { ApiBase } from './../../../../../core/src/lib/service/backend/api.enum';
import { SVGIcons } from './../../svg.generated';

@Component({
  selector: 'yuv-content-preview',
  templateUrl: './content-preview.component.html',
  styleUrls: ['./content-preview.component.scss']
})
export class ContentPreviewComponent implements OnInit {
  private _dmsObject: DmsObject;
  @Input() set dmsObject(object: DmsObject) {
    // genberate preview URI
    if (!object) {
      this.previewSrc = null;
    } else if (!this._dmsObject || object.id !== this._dmsObject.id) {
      if (object.content) {
        const mimeType = encodeURIComponent(object.content.mimeType);
        const path = encodeURIComponent(`${ApiBase.apiWeb}/dms/${object.id}/content`);
        this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`/preview?mimeType=${mimeType}&path=${path}`);
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

  constructor(private elRef: ElementRef, private sanitizer: DomSanitizer) {}

  refresh() {
    if (this.previewSrc) {
      this.elRef.nativeElement.querySelector('iframe').contentWindow.location.reload(true);
    }
  }

  ngOnInit() {}
}
