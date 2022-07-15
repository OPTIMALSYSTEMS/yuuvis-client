import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceListComponent } from './sequence-list.component';

describe('SequenceListComponent', () => {
  let component: SequenceListComponent;
  let fixture: ComponentFixture<SequenceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SequenceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SequenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
