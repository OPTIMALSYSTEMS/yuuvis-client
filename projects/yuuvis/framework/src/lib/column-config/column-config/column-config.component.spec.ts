import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ColumnConfigComponent } from './column-config.component';

describe('ColumnConfigComponent', () => {
  let component: ColumnConfigComponent;
  let fixture: ComponentFixture<ColumnConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
