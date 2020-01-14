import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestGroupedSelectComponent } from './test-grouped-select.component';

describe('TestGroupedSelectComponent', () => {
  let component: TestGroupedSelectComponent;
  let fixture: ComponentFixture<TestGroupedSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestGroupedSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestGroupedSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
