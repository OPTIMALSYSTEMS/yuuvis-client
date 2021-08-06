import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResponsiveTabContainerComponent } from './responsive-tab-container.component';

describe('ResponsiveTabContainerComponent', () => {
  let component: ResponsiveTabContainerComponent;
  let fixture: ComponentFixture<ResponsiveTabContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponsiveTabContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsiveTabContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
