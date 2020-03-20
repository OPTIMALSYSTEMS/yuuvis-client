import { TestBed } from '@angular/core/testing';
import { ColumnConfigService } from './user-config.service';

describe('ColumnConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ColumnConfigService = TestBed.get(ColumnConfigService);
    expect(service).toBeTruthy();
  });
});
