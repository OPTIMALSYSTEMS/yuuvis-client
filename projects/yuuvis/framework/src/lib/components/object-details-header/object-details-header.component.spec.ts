import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectDetailsHeaderComponent } from './object-details-header.component';

describe('ObjectDetailsHeaderComponent', () => {
  let component: ObjectDetailsHeaderComponent;
  let fixture: ComponentFixture<ObjectDetailsHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectDetailsHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectDetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
