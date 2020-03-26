import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiveMasterSlaveComponent } from './responsive-master-slave.component';

describe('ResponsiveMasterSlaveComponent', () => {
  let component: ResponsiveMasterSlaveComponent;
  let fixture: ComponentFixture<ResponsiveMasterSlaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponsiveMasterSlaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsiveMasterSlaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
