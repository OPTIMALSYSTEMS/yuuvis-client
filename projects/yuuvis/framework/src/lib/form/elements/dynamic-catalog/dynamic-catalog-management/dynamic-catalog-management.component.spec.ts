import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicCatalogManagementComponent } from './dynamic-catalog-management.component';

describe('DynamicCatalogManagementComponent', () => {
  let component: DynamicCatalogManagementComponent;
  let fixture: ComponentFixture<DynamicCatalogManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicCatalogManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicCatalogManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
