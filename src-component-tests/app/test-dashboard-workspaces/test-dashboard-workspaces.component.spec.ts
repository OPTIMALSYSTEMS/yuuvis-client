import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDashboardWorkspacesComponent } from './test-dashboard-workspaces.component';

describe('TestDashboardWorkspacesComponent', () => {
  let component: TestDashboardWorkspacesComponent;
  let fixture: ComponentFixture<TestDashboardWorkspacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestDashboardWorkspacesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestDashboardWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
