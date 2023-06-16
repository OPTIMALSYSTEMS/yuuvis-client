/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { ObjectCreateService } from './object-create.service';

describe('Service: ObjectCreate', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ObjectCreateService]
    });
  });

  it('should ...', inject([ObjectCreateService], (service: ObjectCreateService) => {
    expect(service).toBeTruthy();
  }));
});
