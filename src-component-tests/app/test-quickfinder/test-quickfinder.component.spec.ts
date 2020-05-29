import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestQuickfinderComponent } from './test-quickfinder.component';

describe('TestQuickfinderComponent', () => {
  let component: TestQuickfinderComponent;
  let fixture: ComponentFixture<TestQuickfinderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestQuickfinderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestQuickfinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
