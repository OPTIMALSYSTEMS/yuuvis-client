import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionCompareTriggerComponent } from './version-compare-trigger.component';

describe('VersionCompareTriggerComponent', () => {
  let component: VersionCompareTriggerComponent;
  let fixture: ComponentFixture<VersionCompareTriggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionCompareTriggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionCompareTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
