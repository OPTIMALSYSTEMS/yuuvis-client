import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestContextComponent } from './test-context.component';

describe('TestContextComponent', () => {
  let component: TestContextComponent;
  let fixture: ComponentFixture<TestContextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestContextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
