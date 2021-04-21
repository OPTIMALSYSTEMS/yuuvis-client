import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupedSelectComponent } from './grouped-select.component';

describe('GroupedSelectComponent', () => {
  let component: GroupedSelectComponent;
  let fixture: ComponentFixture<GroupedSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupedSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupedSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
