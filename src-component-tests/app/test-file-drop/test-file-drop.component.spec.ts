import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFileDropComponent } from './test-file-drop.component';

describe('TestFileDropComponent', () => {
  let component: TestFileDropComponent;
  let fixture: ComponentFixture<TestFileDropComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestFileDropComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFileDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
