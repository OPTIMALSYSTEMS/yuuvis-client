import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultPanelComponent } from './search-result-panel.component';

describe('SearchResultPanelComponent', () => {
  let component: SearchResultPanelComponent;
  let fixture: ComponentFixture<SearchResultPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
