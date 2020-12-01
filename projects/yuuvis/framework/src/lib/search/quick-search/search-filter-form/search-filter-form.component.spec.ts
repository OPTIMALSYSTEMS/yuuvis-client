import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SearchFilterFormComponent } from './search-filter-form.component';

describe('SearchFilterFormComponent', () => {
  let component: SearchFilterFormComponent;
  let fixture: ComponentFixture<SearchFilterFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchFilterFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
