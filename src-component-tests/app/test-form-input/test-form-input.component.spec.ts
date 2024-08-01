import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFormInputComponent } from './test-form-input.component';

describe('TestFormInputComponent', () => {
  let component: TestFormInputComponent;
  let fixture: ComponentFixture<TestFormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFormInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestFormInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
