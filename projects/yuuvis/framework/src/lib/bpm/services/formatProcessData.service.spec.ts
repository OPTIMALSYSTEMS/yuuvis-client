/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { FormatProcessDataService } from './formatProcessData.service';

describe('Service: FormatProcessData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormatProcessDataService]
    });
  });

  it('should ...', inject([FormatProcessDataService], (service: FormatProcessDataService) => {
    expect(service).toBeTruthy();
  }));
});
