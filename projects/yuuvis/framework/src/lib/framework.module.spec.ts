import { async, TestBed } from '@angular/core/testing';
import { YuvFrameworkModule } from './framework.module';

describe('YuvFrameworkModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [YuvFrameworkModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(YuvFrameworkModule).toBeDefined();
  });
});
