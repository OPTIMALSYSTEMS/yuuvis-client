import { TestBed } from '@angular/core/testing';

import { ObjectHistoryService } from './object-history.service';

describe('ObjectHistoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObjectHistoryService = TestBed.get(ObjectHistoryService);
    expect(service).toBeTruthy();
  });
});
