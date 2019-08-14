import { TestBed } from '@angular/core/testing';

import { CoreInitService } from './core-init.service';

describe('CoreInitService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoreInitService = TestBed.get(CoreInitService);
    expect(service).toBeTruthy();
  });
});
