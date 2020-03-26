import { TestBed } from '@angular/core/testing';

import { UploadRegistryService } from './upload-registry.service';

describe('UploadRegistryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UploadRegistryService = TestBed.get(UploadRegistryService);
    expect(service).toBeTruthy();
  });
});
