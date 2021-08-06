import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectableItemComponent } from './selectable-item.component';

describe('SelectableItemComponent', () => {
  let component: SelectableItemComponent;
  let fixture: ComponentFixture<SelectableItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectableItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
