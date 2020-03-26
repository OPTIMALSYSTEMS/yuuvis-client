import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ActionMenuComponent} from './action-menu.component';
import {ComponentFactoryResolver, NO_ERRORS_SCHEMA, Renderer2} from '@angular/core';
import {ActionService} from '../action-service/action.service';
import {EventService} from '@eo-sdk/core';
import {
  ActionServiceStub,
  ComponentFactoryResolverStub,
  EventServiceStub,
  Renderer2Stub,
} from '../../../../../test/mocks/test-stubs.mock';
import {RouterTestingModule} from '@angular/router/testing';


describe('ActionMenuComponent', () => {
  let component: ActionMenuComponent;
  let fixture: ComponentFixture<ActionMenuComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionMenuComponent],
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        {provide: ActionService, useClass: ActionServiceStub},
        {provide: Renderer2, useClass: Renderer2Stub},
        {provide: ComponentFactoryResolver, useClass: ComponentFactoryResolverStub},
        {provide: EventService, useClass: EventServiceStub}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
