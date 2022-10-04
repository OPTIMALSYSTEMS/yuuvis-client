import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickSearchWidgetComponent } from './quick-search-widget.component';

describe('QuickSearchWidgetComponent', () => {
  let component: QuickSearchWidgetComponent;
  let fixture: ComponentFixture<QuickSearchWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickSearchWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickSearchWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
