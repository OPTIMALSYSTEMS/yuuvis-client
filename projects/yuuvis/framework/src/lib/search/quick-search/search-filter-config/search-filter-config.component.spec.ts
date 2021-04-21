import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SearchFilterConfigComponent } from './search-filter-config.component';

describe('SearchFilterConfigComponent', () => {
  let component: SearchFilterConfigComponent;
  let fixture: ComponentFixture<SearchFilterConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchFilterConfigComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFilterConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
