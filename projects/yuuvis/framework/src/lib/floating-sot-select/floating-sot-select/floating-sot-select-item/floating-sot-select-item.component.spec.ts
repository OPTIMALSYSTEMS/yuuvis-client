import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingSotSelectItemComponent } from './floating-sot-select-item.component';

describe('FloatingSotSelectItemComponent', () => {
  let component: FloatingSotSelectItemComponent;
  let fixture: ComponentFixture<FloatingSotSelectItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingSotSelectItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingSotSelectItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
