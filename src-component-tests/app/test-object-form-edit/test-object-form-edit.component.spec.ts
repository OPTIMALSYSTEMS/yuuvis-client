import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectFormEditComponent } from './test-object-form-edit.component';

describe('TestObjectFormEditComponent', () => {
  let component: TestObjectFormEditComponent;
  let fixture: ComponentFixture<TestObjectFormEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestObjectFormEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestObjectFormEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
