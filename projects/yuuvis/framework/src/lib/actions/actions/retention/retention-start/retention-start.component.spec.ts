import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetentionStartComponent } from './retention-start.component';

describe('RetentionStartComponent', () => {
  let component: RetentionStartComponent;
  let fixture: ComponentFixture<RetentionStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetentionStartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetentionStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
