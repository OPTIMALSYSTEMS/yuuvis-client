import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectDetailsCompareComponent } from './test-object-details-compare.component';

describe('TestObjectDetailsCompareComponent', () => {
  let component: TestObjectDetailsCompareComponent;
  let fixture: ComponentFixture<TestObjectDetailsCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestObjectDetailsCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestObjectDetailsCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
