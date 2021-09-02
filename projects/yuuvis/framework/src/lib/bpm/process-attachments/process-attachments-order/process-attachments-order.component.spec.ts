import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessAttachmentsOrderComponent } from './process-attachments-order.component';

describe('ProcessAttachmentsOrderComponent', () => {
  let component: ProcessAttachmentsOrderComponent;
  let fixture: ComponentFixture<ProcessAttachmentsOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessAttachmentsOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessAttachmentsOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
