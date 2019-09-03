import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSearchResultPanelComponent } from './test-search-result-panel.component';

describe('TestSearchResultPanelComponent', () => {
  let component: TestSearchResultPanelComponent;
  let fixture: ComponentFixture<TestSearchResultPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestSearchResultPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSearchResultPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
