import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionMenuBarComponent } from './action-menu-bar.component';

describe('ActionMenuBarComponent', () => {
  let component: ActionMenuBarComponent;
  let fixture: ComponentFixture<ActionMenuBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionMenuBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionMenuBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
