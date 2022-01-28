import { TestBed } from '@angular/core/testing';

import { AppCommandPaletteService } from './app-command-palette.service';

describe('AppCommandPaletteService', () => {
  let service: AppCommandPaletteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppCommandPaletteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
