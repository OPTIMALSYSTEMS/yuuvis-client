import { TestBed, waitForAsync } from '@angular/core/testing';
import { YuvCoreModule } from './core.module';

describe('CoreModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [YuvCoreModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(YuvCoreModule).toBeDefined();
  });
});
