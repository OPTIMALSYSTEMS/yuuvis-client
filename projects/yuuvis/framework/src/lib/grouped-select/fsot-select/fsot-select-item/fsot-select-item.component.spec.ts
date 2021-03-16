import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FsotSelectItemComponent } from './fsot-select-item.component';

describe('FsotSelectItemComponent', () => {
  let component: FsotSelectItemComponent;
  let fixture: ComponentFixture<FsotSelectItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FsotSelectItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FsotSelectItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
