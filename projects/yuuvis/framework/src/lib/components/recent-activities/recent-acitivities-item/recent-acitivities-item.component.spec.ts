import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentAcitivitiesItemComponent } from './recent-acitivities-item.component';

describe('RecentAcitivitiesItemComponent', () => {
  let component: RecentAcitivitiesItemComponent;
  let fixture: ComponentFixture<RecentAcitivitiesItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentAcitivitiesItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentAcitivitiesItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
