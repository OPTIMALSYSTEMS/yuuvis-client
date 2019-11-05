import { TestBed } from '@angular/core/testing';

import { ObjectFormTranslateService } from './object-form-translate.service';

describe('ObjectFormTranslateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObjectFormTranslateService = TestBed.get(ObjectFormTranslateService);
    expect(service).toBeTruthy();
  });
});
