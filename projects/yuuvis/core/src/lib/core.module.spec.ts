import { async, TestBed } from '@angular/core/testing';
import { YuvCoreModule } from './core.module';

describe('CoreModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [YuvCoreModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(YuvCoreModule).toBeDefined();
  });
});
