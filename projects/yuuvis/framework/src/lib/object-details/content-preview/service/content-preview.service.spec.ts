/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { ContentPreviewService } from './content-preview.service';

describe('Service: ContentPreview', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentPreviewService]
    });
  });

  it('should ...', inject([ContentPreviewService], (service: ContentPreviewService) => {
    expect(service).toBeTruthy();
  }));
});
