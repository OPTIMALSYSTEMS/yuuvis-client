import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWorkspacesComponent } from './dashboard-workspaces.component';

describe('DashboardWorkspacesComponent', () => {
  let component: DashboardWorkspacesComponent;
  let fixture: ComponentFixture<DashboardWorkspacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardWorkspacesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
