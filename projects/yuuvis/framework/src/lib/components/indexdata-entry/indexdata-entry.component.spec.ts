import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexdataEntryComponent } from './indexdata-entry.component';

describe('IndexdataEntryComponent', () => {
  let component: IndexdataEntryComponent;
  let fixture: ComponentFixture<IndexdataEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexdataEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexdataEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
