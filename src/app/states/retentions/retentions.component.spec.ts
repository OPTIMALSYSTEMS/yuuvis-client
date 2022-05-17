import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetentionsComponent } from './retentions.component';

describe('RetentionsComponent', () => {
  let component: RetentionsComponent;
  let fixture: ComponentFixture<RetentionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetentionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetentionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
