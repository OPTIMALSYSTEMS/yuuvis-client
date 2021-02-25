import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KeysPipe } from '../../pipes';
import { ObjectFormGroupComponent } from './object-form-group.component';

describe('ObjectFormGroupComponent', () => {
  let component: ObjectFormGroupComponent;
  let fixture: ComponentFixture<ObjectFormGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ObjectFormGroupComponent, KeysPipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
