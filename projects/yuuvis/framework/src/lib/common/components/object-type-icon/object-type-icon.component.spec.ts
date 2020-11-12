import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObjectTypeIconComponent } from './object-type-icon.component';

describe('ObjectTypeIconComponent', () => {
  let component: ObjectTypeIconComponent;
  let fixture: ComponentFixture<ObjectTypeIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectTypeIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTypeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
