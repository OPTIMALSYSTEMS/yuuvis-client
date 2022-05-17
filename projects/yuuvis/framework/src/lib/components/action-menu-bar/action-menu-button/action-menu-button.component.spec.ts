import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionMenuButtonComponent } from './action-menu-button.component';

describe('ActionMenuButtonComponent', () => {
  let component: ActionMenuButtonComponent;
  let fixture: ComponentFixture<ActionMenuButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionMenuButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
