import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectTypeRendererComponent } from './object-type-renderer.component';

describe('ObjectTypeRendererComponent', () => {
  let component: ObjectTypeRendererComponent;
  let fixture: ComponentFixture<ObjectTypeRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectTypeRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTypeRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
