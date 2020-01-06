import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableGroupComponent } from './selectable-group.component';

describe('SelectableGroupComponent', () => {
  let component: SelectableGroupComponent;
  let fixture: ComponentFixture<SelectableGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectableGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectableGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
