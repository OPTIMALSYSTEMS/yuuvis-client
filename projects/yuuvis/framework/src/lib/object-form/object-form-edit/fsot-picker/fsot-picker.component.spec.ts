import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsotPickerComponent } from './fsot-picker.component';

describe('FsotPickerComponent', () => {
  let component: FsotPickerComponent;
  let fixture: ComponentFixture<FsotPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsotPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsotPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
