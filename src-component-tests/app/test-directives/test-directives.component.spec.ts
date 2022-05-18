import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDirectivesComponent } from './test-directives.component';

describe('TestDirectivesComponent', () => {
  let component: TestDirectivesComponent;
  let fixture: ComponentFixture<TestDirectivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestDirectivesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestDirectivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
