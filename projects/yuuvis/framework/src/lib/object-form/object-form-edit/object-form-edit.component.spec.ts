import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObjectFormEditComponent } from './object-form-edit.component';

describe('ObjectFormEditComponent', () => {
  let component: ObjectFormEditComponent;
  let fixture: ComponentFixture<ObjectFormEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectFormEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectFormEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
