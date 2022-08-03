import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceListTemplateManageComponent } from './sequence-list-template-manage.component';

describe('SequenceListTemplateManageComponent', () => {
  let component: SequenceListTemplateManageComponent;
  let fixture: ComponentFixture<SequenceListTemplateManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SequenceListTemplateManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SequenceListTemplateManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
