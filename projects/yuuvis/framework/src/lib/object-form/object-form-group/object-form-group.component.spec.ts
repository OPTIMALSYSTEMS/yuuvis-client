import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ObjectFormGroupComponent} from './object-form-group.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {KeysPipe} from '../../../../eo-framework-core/pipes/keys.pipe';

describe('ObjectFormGroupComponent', () => {

  let component: ObjectFormGroupComponent;
  let fixture: ComponentFixture<ObjectFormGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ObjectFormGroupComponent, KeysPipe]
    })
      .compileComponents();
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
