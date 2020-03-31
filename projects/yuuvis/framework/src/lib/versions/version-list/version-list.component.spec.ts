import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VersionListComponent } from './version-list.component';

describe('VersionsComponent', () => {
  let component: VersionListComponent;
  let fixture: ComponentFixture<VersionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VersionListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
