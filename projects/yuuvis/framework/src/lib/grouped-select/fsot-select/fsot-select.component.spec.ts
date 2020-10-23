import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsotSelectComponent } from './fsot-select.component';

describe('FsotSelectComponent', () => {
  let component: FsotSelectComponent;
  let fixture: ComponentFixture<FsotSelectComponent>;

  beforeEach(async(() => {
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
