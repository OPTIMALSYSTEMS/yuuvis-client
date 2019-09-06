import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestQuickSearchComponent } from './test-quick-search.component';

describe('TestQuickSearchComponent', () => {
  let component: TestQuickSearchComponent;
  let fixture: ComponentFixture<TestQuickSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestQuickSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestQuickSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
