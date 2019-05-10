import { TestBed } from '@angular/core/testing';

import { LoggerConsoleService } from './logger-console.service';

describe('LoggerConsoleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoggerConsoleService = TestBed.get(LoggerConsoleService);
    expect(service).toBeTruthy();
  });
});
