import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessDetailsSummaryComponent } from './process-details-summary.component';

describe('ProcessDetailsSummaryComponent', () => {
  let component: ProcessDetailsSummaryComponent;
  let fixture: ComponentFixture<ProcessDetailsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessDetailsSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessDetailsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
