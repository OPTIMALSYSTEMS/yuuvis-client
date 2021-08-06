import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPopoverComponent } from './test-popover.component';

describe('TestPopoverComponent', () => {
  let component: TestPopoverComponent;
  let fixture: ComponentFixture<TestPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestPopoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
