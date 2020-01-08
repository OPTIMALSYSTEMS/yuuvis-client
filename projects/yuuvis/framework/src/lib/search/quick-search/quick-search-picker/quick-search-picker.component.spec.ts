import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickSearchPickerComponent } from './quick-search-picker.component';

describe('QuickSearchPickerComponent', () => {
  let component: QuickSearchPickerComponent;
  let fixture: ComponentFixture<QuickSearchPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickSearchPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickSearchPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
