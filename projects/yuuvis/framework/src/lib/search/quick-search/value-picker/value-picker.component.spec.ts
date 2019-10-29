import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuePickerComponent } from './value-picker.component';

describe('ValuePickerComponent', () => {
  let component: ValuePickerComponent;
  let fixture: ComponentFixture<ValuePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValuePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValuePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
