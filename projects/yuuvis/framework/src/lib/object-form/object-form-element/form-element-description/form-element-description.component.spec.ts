import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormElementDescriptionComponent } from './form-element-description.component';

describe('FormElementDescriptionComponent', () => {
  let component: FormElementDescriptionComponent;
  let fixture: ComponentFixture<FormElementDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormElementDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormElementDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
