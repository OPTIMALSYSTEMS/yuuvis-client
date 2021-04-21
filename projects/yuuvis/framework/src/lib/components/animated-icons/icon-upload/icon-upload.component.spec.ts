import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IconUploadComponent } from './icon-upload.component';

describe('IconUploadComponent', () => {
  let component: IconUploadComponent;
  let fixture: ComponentFixture<IconUploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IconUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
