import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickfinderComponent } from './quickfinder.component';

describe('QuickfinderComponent', () => {
  let component: QuickfinderComponent;
  let fixture: ComponentFixture<QuickfinderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickfinderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickfinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
