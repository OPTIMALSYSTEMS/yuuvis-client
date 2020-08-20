import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterConfigurationComponent } from './filter-configuration.component';

describe('FilterConfigurationComponent', () => {
  let component: FilterConfigurationComponent;
  let fixture: ComponentFixture<FilterConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
