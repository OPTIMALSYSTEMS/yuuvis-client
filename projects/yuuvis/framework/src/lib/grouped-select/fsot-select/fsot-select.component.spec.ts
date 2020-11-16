import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FsotSelectComponent } from './fsot-select.component';

describe('FsotSelectComponent', () => {
  let component: FsotSelectComponent;
  let fixture: ComponentFixture<FsotSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FsotSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsotSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
