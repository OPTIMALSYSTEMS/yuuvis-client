import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRecentActivitiesComponent } from './test-recent-activities.component';

describe('TestRecentActivitiesComponent', () => {
  let component: TestRecentActivitiesComponent;
  let fixture: ComponentFixture<TestRecentActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestRecentActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRecentActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
