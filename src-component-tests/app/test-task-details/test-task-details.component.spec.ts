import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestTaskDetailsComponent } from './test-task-details.component';

describe('TestTaskDetailsComponent', () => {
  let component: TestTaskDetailsComponent;
  let fixture: ComponentFixture<TestTaskDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestTaskDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestTaskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
