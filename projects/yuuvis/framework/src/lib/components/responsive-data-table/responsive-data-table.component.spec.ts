import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResponsiveDataTableComponent } from './responsive-data-table.component';

describe('ResponsiveDataTableComponent', () => {
  let component: ResponsiveDataTableComponent;
  let fixture: ComponentFixture<ResponsiveDataTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponsiveDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsiveDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
