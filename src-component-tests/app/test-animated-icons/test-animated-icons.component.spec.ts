import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAnimatedIconsComponent } from './test-animated-icons.component';

describe('TestAnimatedIconsComponent', () => {
  let component: TestAnimatedIconsComponent;
  let fixture: ComponentFixture<TestAnimatedIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestAnimatedIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAnimatedIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
