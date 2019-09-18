import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ObjectStateComponent } from './object-state.component';

describe('ObjectStateComponent', () => {
  let component: ObjectStateComponent;
  let fixture: ComponentFixture<ObjectStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObjectStateComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
