import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestActionMenuComponent } from './test-action-menu.component';

describe('TestActionMenuComponent', () => {
  let component: TestActionMenuComponent;
  let fixture: ComponentFixture<TestActionMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestActionMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestActionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
