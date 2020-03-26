import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectCreateComponent } from './object-create.component';

describe('ObjectCreateComponent', () => {
  let component: ObjectCreateComponent;
  let fixture: ComponentFixture<ObjectCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
