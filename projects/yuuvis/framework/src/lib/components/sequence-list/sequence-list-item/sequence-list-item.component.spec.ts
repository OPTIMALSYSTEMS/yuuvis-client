import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceListItemComponent } from './sequence-list-item.component';

describe('SequenceListItemComponent', () => {
  let component: SequenceListItemComponent;
  let fixture: ComponentFixture<SequenceListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SequenceListItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SequenceListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
