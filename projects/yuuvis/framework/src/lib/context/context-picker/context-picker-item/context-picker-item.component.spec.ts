import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextPickerItemComponent } from './context-picker-item.component';

describe('ContextPickerItemComponent', () => {
  let component: ContextPickerItemComponent;
  let fixture: ComponentFixture<ContextPickerItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextPickerItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextPickerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
