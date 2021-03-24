import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicCatalogComponent } from './dynamic-catalog.component';

describe('DynamicCatalogComponent', () => {
  let component: DynamicCatalogComponent;
  let fixture: ComponentFixture<DynamicCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
