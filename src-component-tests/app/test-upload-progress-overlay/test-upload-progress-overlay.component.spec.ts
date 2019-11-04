import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUploadProgressOverlayComponent } from './test-upload-progress-overlay.component';

describe('TestUploadProgressOverlayComponent', () => {
  let component: TestUploadProgressOverlayComponent;
  let fixture: ComponentFixture<TestUploadProgressOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestUploadProgressOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestUploadProgressOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
