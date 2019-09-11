import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectDetailsComponent } from './test-object-details.component';

describe('TestObjectDetailsComponent', () => {
  let component: TestObjectDetailsComponent;
  let fixture: ComponentFixture<TestObjectDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestObjectDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestObjectDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
