import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessAttachmentsComponent } from './process-attachments.component';

describe('ProcessAttachmentsComponent', () => {
  let component: ProcessAttachmentsComponent;
  let fixture: ComponentFixture<ProcessAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessAttachmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
