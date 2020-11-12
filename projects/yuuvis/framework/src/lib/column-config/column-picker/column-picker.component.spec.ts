import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ColumnPickerComponent } from './column-picker.component';

describe('ColumnPickerComponent', () => {
  let component: ColumnPickerComponent;
  let fixture: ComponentFixture<ColumnPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
