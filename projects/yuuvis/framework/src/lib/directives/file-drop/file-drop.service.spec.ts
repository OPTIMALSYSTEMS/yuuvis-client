import { TestBed } from '@angular/core/testing';

import { FileDropService } from './file-drop.service';

describe('FileDropService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileDropService = TestBed.get(FileDropService);
    expect(service).toBeTruthy();
  });
});
