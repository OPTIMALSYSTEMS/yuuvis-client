import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectFormElementComponent } from './object-form-element.component';

describe('ObjectFormElementComponent', () => {
  let component: ObjectFormElementComponent;
  let fixture: ComponentFixture<ObjectFormElementComponent>;

  beforeEach(async(() => {
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
