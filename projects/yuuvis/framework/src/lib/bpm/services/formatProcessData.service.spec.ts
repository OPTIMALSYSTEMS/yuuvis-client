/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
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
