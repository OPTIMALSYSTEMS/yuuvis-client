import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationSetComponent } from './organization-set.component';

describe('OrganizationSetComponent', () => {
  let component: OrganizationSetComponent;
  let fixture: ComponentFixture<OrganizationSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationSetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
