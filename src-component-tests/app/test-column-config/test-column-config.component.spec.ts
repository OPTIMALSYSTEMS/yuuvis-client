import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestColumnConfigComponent } from './test-column-config.component';

describe('TestColumnConfigComponent', () => {
  let component: TestColumnConfigComponent;
  let fixture: ComponentFixture<TestColumnConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestColumnConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestColumnConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
