import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectPickerComponent } from './test-object-picker.component';

describe('TestObjectPickerComponent', () => {
  let component: TestObjectPickerComponent;
  let fixture: ComponentFixture<TestObjectPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestObjectPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestObjectPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
