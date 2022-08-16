import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceListTemplatesComponent } from './sequence-list-templates.component';

describe('SequenceListTemplatesComponent', () => {
  let component: SequenceListTemplatesComponent;
  let fixture: ComponentFixture<SequenceListTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SequenceListTemplatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SequenceListTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
