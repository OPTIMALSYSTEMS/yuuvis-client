import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDelegatePickerComponent } from './task-delegate-picker.component';

describe('TaskDelegatePickerComponent', () => {
  let component: TaskDelegatePickerComponent;
  let fixture: ComponentFixture<TaskDelegatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskDelegatePickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDelegatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
