import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsHistoryComponent } from './task-details-history.component';

describe('TaskDetailsHistoryComponent', () => {
  let component: TaskDetailsHistoryComponent;
  let fixture: ComponentFixture<TaskDetailsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskDetailsHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
