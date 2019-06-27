import { TestBed } from '@angular/core/testing';

import { DmsService } from './dms.service';

describe('DmsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DmsService = TestBed.get(DmsService);
    expect(service).toBeTruthy();
  });
});
