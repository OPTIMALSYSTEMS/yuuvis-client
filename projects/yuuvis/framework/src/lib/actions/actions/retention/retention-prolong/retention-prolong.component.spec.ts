import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetentionProlongComponent } from './retention-prolong.component';

describe('RetentionProlongComponent', () => {
  let component: RetentionProlongComponent;
  let fixture: ComponentFixture<RetentionProlongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetentionProlongComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetentionProlongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
