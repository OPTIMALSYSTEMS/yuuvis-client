import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectTypePickerComponent } from './object-type-picker.component';

describe('ObjectTypePickerComponent', () => {
  let component: ObjectTypePickerComponent;
  let fixture: ComponentFixture<ObjectTypePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectTypePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTypePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
