import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestIconsComponent } from './test-icons.component';

describe('TestIconsComponent', () => {
  let component: TestIconsComponent;
  let fixture: ComponentFixture<TestIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
