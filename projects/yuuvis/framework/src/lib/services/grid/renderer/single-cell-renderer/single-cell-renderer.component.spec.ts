import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SingleCellRendererComponent } from './single-cell-renderer.component';

describe('SingleCellRendererComponent', () => {
  let component: SingleCellRendererComponent;
  let fixture: ComponentFixture<SingleCellRendererComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
