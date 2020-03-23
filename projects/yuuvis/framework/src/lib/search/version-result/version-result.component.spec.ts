import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VersionResultComponent } from './version-result.component';

describe('VersionResultComponent', () => {
  let component: VersionResultComponent;
  let fixture: ComponentFixture<VersionResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VersionResultComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
