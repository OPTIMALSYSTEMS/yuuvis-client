import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingSotSelectComponent } from './floating-sot-select.component';

describe('FloatingSotSelectComponent', () => {
  let component: FloatingSotSelectComponent;
  let fixture: ComponentFixture<FloatingSotSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingSotSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingSotSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
