import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSequenceListComponent } from './test-sequence-list.component';

describe('TestSequenceListComponent', () => {
  let component: TestSequenceListComponent;
  let fixture: ComponentFixture<TestSequenceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestSequenceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSequenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
