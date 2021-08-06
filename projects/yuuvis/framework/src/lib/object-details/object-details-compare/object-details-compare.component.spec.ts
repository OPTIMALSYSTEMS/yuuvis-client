import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObjectDetailsCompareComponent } from './object-details-compare.component';

describe('ObjectDetailsCompareComponent', () => {
  let component: ObjectDetailsCompareComponent;
  let fixture: ComponentFixture<ObjectDetailsCompareComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectDetailsCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectDetailsCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
