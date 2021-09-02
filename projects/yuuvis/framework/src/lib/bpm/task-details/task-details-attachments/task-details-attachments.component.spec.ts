import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsAttachmentsComponent } from './task-details-attachments.component';

describe('TaskDetailsAttachmentsComponent', () => {
  let component: TaskDetailsAttachmentsComponent;
  let fixture: ComponentFixture<TaskDetailsAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskDetailsAttachmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailsAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
