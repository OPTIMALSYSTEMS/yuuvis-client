import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectFormComponent } from './test-object-form.component';

describe('TestObjectFormComponent', () => {
  let component: TestObjectFormComponent;
  let fixture: ComponentFixture<TestObjectFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestObjectFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestObjectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
