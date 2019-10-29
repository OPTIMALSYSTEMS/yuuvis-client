import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuePickerItemComponent } from './value-picker-item.component';

describe('ValuePickerItemComponent', () => {
  let component: ValuePickerItemComponent;
  let fixture: ComponentFixture<ValuePickerItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValuePickerItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValuePickerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
