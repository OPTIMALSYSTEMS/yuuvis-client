import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFormElementsComponent } from './test-form-elements.component';

describe('TestFormElementsComponent', () => {
  let component: TestFormElementsComponent;
  let fixture: ComponentFixture<TestFormElementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestFormElementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFormElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
