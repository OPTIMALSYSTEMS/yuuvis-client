import { TestBed } from '@angular/core/testing';

import { OfflineGuardService } from './offline-guard.service';

describe('OfflineGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OfflineGuardService = TestBed.get(OfflineGuardService);
    expect(service).toBeTruthy();
  });
});
