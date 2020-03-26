import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUserAvatarComponent } from './test-user-avatar.component';

describe('TestUserAvatarComponent', () => {
  let component: TestUserAvatarComponent;
  let fixture: ComponentFixture<TestUserAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestUserAvatarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestUserAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
