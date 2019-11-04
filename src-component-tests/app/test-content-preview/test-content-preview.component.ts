import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-test-content-preview',
  templateUrl: './test-content-preview.component.html',
  styleUrls: ['./test-content-preview.component.scss']
})
export class TestContentPreviewComponent implements OnInit {
  private _source: Source = null;
  sourceUrl: Source[] = [
    { label: 'email', id: 'b22fba48-bc4e-414b-b1a7-236b9244664a', content: { mimeType: 'message/rfc822' } },
    { label: 'email_with_attachment', id: '325ca34e-36a2-429c-9a42-6202b4da99f3', content: { mimeType: 'message/rfc822' } },
    { label: 'email_with_multi_attachment', id: 'aeb19b4b-d44b-4dfb-b852-d0358c7cc294', content: { mimeType: 'message/rfc822' } },
    { label: 'json', id: 'b1b40a83-160b-443c-ad2f-f77e218877ee', content: { mimeType: 'application/json' } },
    { label: 'zip', id: '5b999c33-38ff-427c-8802-76073fb1d0f0', content: { mimeType: 'application/zip' } },
    { label: 'pdf', id: '39bd9f91-aeff-45cc-a6e7-a9c4743afc9a', content: { mimeType: 'application/pdf' } },
    { label: 'mp3', id: '272c4953-f0b1-4126-839e-cf5e108804bb', content: { mimeType: 'audio/mpeg' } },
    { label: 'mp4', id: 'bf776ca9-4cb8-4cf5-9f0b-4bcf630e8769', content: { mimeType: 'audio/mpeg' } },
    { label: 'jpeg', id: '9ed5a3a2-d9c5-4cff-be2d-94cc7755d49e', content: { mimeType: 'image/jpeg' } },
    { label: 'crx', id: 'e3e185f6-85ce-4485-af00-d6fccf5391d5', content: { mimeType: 'image/tiff' } },
    { label: 'tiff', id: '0091a6bc-0dac-4792-bebd-4408dde6f1d5', content: { mimeType: 'image/tiff' } },
    { label: 'markdown', id: '664a1d20-2085-4014-a803-4bd2276850ba', content: { mimeType: 'text/x-web-markdown' } }
  ];

  constructor() {}

  set source(type: Source) {
    this._source = type;
  }

  get source(): Source {
    return this._source;
  }

  ngOnInit() {}
}

interface Source {
  label: string;
  id: string;
  content: {
    mimeType: string;
  };
}
