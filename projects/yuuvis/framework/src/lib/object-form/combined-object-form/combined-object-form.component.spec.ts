import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedObjectFormComponent } from './combined-object-form.component';

describe('CombinedObjectFormComponent', () => {
  let component: CombinedObjectFormComponent;
  let fixture: ComponentFixture<CombinedObjectFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CombinedObjectFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinedObjectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
