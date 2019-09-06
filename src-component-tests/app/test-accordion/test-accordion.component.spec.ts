import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAccordionComponent } from './test-accordion.component';

describe('TestAccordionComponent', () => {
  let component: TestAccordionComponent;
  let fixture: ComponentFixture<TestAccordionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestAccordionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
