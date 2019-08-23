import { TestBed } from '@angular/core/testing';

import { ObjectFormService } from './object-form.service';

describe('ObjectFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObjectFormService = TestBed.get(ObjectFormService);
    expect(service).toBeTruthy();
  });
});
