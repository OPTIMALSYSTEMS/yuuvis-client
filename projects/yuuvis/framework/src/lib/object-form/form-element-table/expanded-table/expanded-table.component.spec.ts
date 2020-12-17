import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandedTableComponent } from './expanded-table.component';

describe('ExpandedTableComponent', () => {
  let component: ExpandedTableComponent;
  let fixture: ComponentFixture<ExpandedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpandedTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
