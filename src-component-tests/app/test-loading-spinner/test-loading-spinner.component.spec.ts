import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestLoadingSpinnerComponent } from './test-loading-spinner.component';

describe('TestLoadingSpinnerComponent', () => {
  let component: TestLoadingSpinnerComponent;
  let fixture: ComponentFixture<TestLoadingSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestLoadingSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestLoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
