import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsCommentsComponent } from './task-details-comments.component';

describe('TaskDetailsCommentsComponent', () => {
  let component: TaskDetailsCommentsComponent;
  let fixture: ComponentFixture<TaskDetailsCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskDetailsCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailsCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
