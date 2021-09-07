import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectPickerComponent } from './object-picker.component';

describe('ObjectPickerComponent', () => {
  let component: ObjectPickerComponent;
  let fixture: ComponentFixture<ObjectPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
