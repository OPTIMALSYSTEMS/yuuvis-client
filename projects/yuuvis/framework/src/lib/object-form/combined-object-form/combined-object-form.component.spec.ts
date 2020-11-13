import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CombinedObjectFormComponent } from './combined-object-form.component';

describe('CombinedObjectFormComponent', () => {
  let component: CombinedObjectFormComponent;
  let fixture: ComponentFixture<CombinedObjectFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CombinedObjectFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinedObjectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
