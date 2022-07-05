import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestProcessDetailsComponent } from './test-process-details.component';

describe('TestProcessDetailsComponent', () => {
  let component: TestProcessDetailsComponent;
  let fixture: ComponentFixture<TestProcessDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestProcessDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestProcessDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
