import { TestBed } from '@angular/core/testing';

import { AppSearchService } from './app-search.service';

describe('AppSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppSearchService = TestBed.get(AppSearchService);
    expect(service).toBeTruthy();
  });
});
