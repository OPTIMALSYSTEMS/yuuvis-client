import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestVersionListComponent } from './test-version-list.component';

describe('TestVersionListComponent', () => {
  let component: TestVersionListComponent;
  let fixture: ComponentFixture<TestVersionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestVersionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestVersionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
