import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsTaskComponent } from './task-details-task.component';

describe('TaskDetailsTaskComponent', () => {
  let component: TaskDetailsTaskComponent;
  let fixture: ComponentFixture<TaskDetailsTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskDetailsTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailsTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
