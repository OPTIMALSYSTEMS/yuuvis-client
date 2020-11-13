import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickfinderEntryComponent } from './quickfinder-entry.component';

describe('QuickfinderEntryComponent', () => {
  let component: QuickfinderEntryComponent;
  let fixture: ComponentFixture<QuickfinderEntryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickfinderEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickfinderEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
