import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DmsObjectTileComponent } from './dms-object-tile.component';

describe('DmsObjectTileComponent', () => {
  let component: DmsObjectTileComponent;
  let fixture: ComponentFixture<DmsObjectTileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DmsObjectTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmsObjectTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
