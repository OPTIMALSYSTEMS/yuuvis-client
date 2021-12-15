import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskflowStartComponent } from './taskflow-start.component';

describe('TaskflowStartComponent', () => {
  let component: TaskflowStartComponent;
  let fixture: ComponentFixture<TaskflowStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskflowStartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskflowStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
