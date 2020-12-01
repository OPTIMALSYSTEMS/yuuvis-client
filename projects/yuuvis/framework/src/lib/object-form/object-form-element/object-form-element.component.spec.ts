import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObjectFormElementComponent } from './object-form-element.component';

describe('ObjectFormElementComponent', () => {
  let component: ObjectFormElementComponent;
  let fixture: ComponentFixture<ObjectFormElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectFormElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectFormElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
