import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextPickerComponent } from './context-picker.component';

describe('ContextPickerComponent', () => {
  let component: ContextPickerComponent;
  let fixture: ComponentFixture<ContextPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
