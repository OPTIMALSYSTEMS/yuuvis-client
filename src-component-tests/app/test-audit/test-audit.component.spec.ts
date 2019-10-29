import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAuditComponent } from './test-audit.component';

describe('TestAuditComponent', () => {
  let component: TestAuditComponent;
  let fixture: ComponentFixture<TestAuditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestAuditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
