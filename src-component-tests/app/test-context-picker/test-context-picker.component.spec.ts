import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestContextPickerComponent } from './test-context-picker.component';

describe('TestContextPickerComponent', () => {
  let component: TestContextPickerComponent;
  let fixture: ComponentFixture<TestContextPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestContextPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestContextPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
