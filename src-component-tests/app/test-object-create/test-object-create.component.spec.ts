import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectCreateComponent } from './test-object-create.component';

describe('TestObjectCreateComponent', () => {
  let component: TestObjectCreateComponent;
  let fixture: ComponentFixture<TestObjectCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestObjectCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestObjectCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
