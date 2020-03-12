import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnConfigSelectComponent } from './column-config-select.component';

describe('ColumnConfigSelectComponent', () => {
  let component: ColumnConfigSelectComponent;
  let fixture: ComponentFixture<ColumnConfigSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnConfigSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnConfigSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
