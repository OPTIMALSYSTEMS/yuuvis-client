import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileCellRendererComponent } from './tile-cell-renderer.component';

describe('TileCellRendererComponent', () => {
  let component: TileCellRendererComponent;
  let fixture: ComponentFixture<TileCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
