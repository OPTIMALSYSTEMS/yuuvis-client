import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSearchResultComponent } from './test-search-result.component';

describe('TestSearchResultComponent', () => {
  let component: TestSearchResultComponent;
  let fixture: ComponentFixture<TestSearchResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestSearchResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
