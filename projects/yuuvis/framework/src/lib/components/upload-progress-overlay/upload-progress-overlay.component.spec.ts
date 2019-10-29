import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadProgressOverlayComponent } from './upload-progress-overlay.component';

describe('UploadProgressOverlayComponent', () => {
  let component: UploadProgressOverlayComponent;
  let fixture: ComponentFixture<UploadProgressOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadProgressOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadProgressOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
