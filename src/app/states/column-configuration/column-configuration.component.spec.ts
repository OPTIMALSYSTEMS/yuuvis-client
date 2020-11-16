import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ColumnConfigurationComponent } from './column-configuration.component';

describe('ColumnConfigurationComponent', () => {
  let component: ColumnConfigurationComponent;
  let fixture: ComponentFixture<ColumnConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
