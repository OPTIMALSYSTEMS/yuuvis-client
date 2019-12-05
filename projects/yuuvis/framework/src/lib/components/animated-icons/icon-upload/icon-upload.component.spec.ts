import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconUploadComponent } from './icon-upload.component';

describe('IconUploadComponent', () => {
  let component: IconUploadComponent;
  let fixture: ComponentFixture<IconUploadComponent>;

  beforeEach(async(() => {
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
