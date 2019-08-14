import { TestBed } from '@angular/core/testing';

import { AppCacheService } from './app-cache.service';

describe('AppCacheService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppCacheService = TestBed.get(AppCacheService);
    expect(service).toBeTruthy();
  });
});
