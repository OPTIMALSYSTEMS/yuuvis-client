import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-test-content-preview',
  templateUrl: './test-content-preview.component.html',
  styleUrls: ['./test-content-preview.component.scss']
})
export class TestContentPreviewComponent implements OnInit {
  sourceUrl = {
    json: 'http://localhost:9000/preview?mimeType=application%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest.json',
    eml: 'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest.eml',
    'eml-att': 'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_attachment.eml',
    'eml-att-pdf': 'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_pdf_mail.eml',
    'eml-att-multi': 'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_multi_upload.eml',
    md: 'http://localhost:9000/preview?mimeType=text%2Fmarkdown&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest.md',
    pdf: 'http://localhost:9000/preview?mimeType=application%2Fpdf&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest.pdf',
    mp4: 'http://localhost:9000/preview?mimeType=video%2Fmp4&path=%2F%2Fvjs.zencdn.net%2Fv%2Foceans.mp4',
    mp3: 'http://localhost:9000/preview?mimeType=audio%2Fmp3&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Fsample.mp3',
    jpg: 'http://localhost:9000/preview?mimeType=image%2Fmp4&path=http%3A%2F%2Finterfacelift.com%2Fwallpaper%2Fpreviews%2F03818_posinghummingbird_672x420.jpg',
    'error-file': 'http://localhost:9000/preview?mimeType=mail%2Fjson&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_multi_.eml',
    'error-type': 'http://localhost:9000/preview?mimeType=blaaaaa&path=http%3A%2F%2Flocalhost%3A9000%2Fassets%2Ftest%2Ftest_multi_.eml'
  };

  _source: string;

  constructor() {}

  set source(type: string) {
    this._source = this.sourceUrl[type];
  }

  get source(): string {
    return this._source;
  }

  ngOnInit() {}
}
