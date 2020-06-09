import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceItemComponent } from './reference-item.component';

describe('ReferenceItemComponent', () => {
  let component: ReferenceItemComponent;
  let fixture: ComponentFixture<ReferenceItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferenceItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
