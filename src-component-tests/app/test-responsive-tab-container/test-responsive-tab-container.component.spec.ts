import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestResponsiveTabContainerComponent } from './test-responsive-tab-container.component';

describe('TestResponsiveTabContainerComponent', () => {
  let component: TestResponsiveTabContainerComponent;
  let fixture: ComponentFixture<TestResponsiveTabContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestResponsiveTabContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestResponsiveTabContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
