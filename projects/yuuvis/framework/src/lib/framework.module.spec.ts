import { TestBed, waitForAsync } from '@angular/core/testing';
import { YuvFrameworkModule } from './framework.module';

describe('YuvFrameworkModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [YuvFrameworkModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(YuvFrameworkModule).toBeDefined();
  });
});
