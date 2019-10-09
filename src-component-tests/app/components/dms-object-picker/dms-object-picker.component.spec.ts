import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DmsObjectPickerComponent } from './dms-object-picker.component';

describe('DmsObjectPickerComponent', () => {
  let component: DmsObjectPickerComponent;
  let fixture: ComponentFixture<DmsObjectPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DmsObjectPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmsObjectPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
