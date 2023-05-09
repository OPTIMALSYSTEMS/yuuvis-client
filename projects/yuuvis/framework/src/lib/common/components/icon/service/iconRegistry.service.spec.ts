/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { IconRegistryService } from './iconRegistry.service';

describe('Service: IconRegistry', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IconRegistryService]
    });
  });

  it('should ...', inject([IconRegistryService], (service: IconRegistryService) => {
    expect(service).toBeTruthy();
  }));
});
